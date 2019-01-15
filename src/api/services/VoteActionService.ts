// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { Vote } from '../models/Vote';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { SmsgService } from './SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { VoteFactory } from '../factories/VoteFactory';
import { VoteService } from './VoteService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { VoteMessageType } from '../enums/VoteMessageType';
import { CoreRpcService } from './CoreRpcService';
import { MessageException } from '../exceptions/MessageException';
import { VoteMessage } from '../messages/VoteMessage';
import { ProposalService } from './ProposalService';
import { VoteUpdateRequest } from '../requests/VoteUpdateRequest';
import { ProposalResultService } from './ProposalResultService';
import { ProposalResultUpdateRequest } from '../requests/ProposalResultUpdateRequest';
import { ProposalOptionResultUpdateRequest } from '../requests/ProposalOptionResultUpdateRequest';
import { ProposalOptionService } from './ProposalOptionService';
import { ProposalOptionResultService } from './ProposalOptionResultService';
import { ProposalType } from '../enums/ProposalType';
import { ProposalOptionResult } from '../models/ProposalOptionResult';
import { ListingItemService } from './ListingItemService';
import { SmsgMessageService } from './SmsgMessageService';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';

export class VoteActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) public proposalOptionResultService: ProposalOptionResultService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     *
     * @param {"resources".Proposal} proposal
     * @param {"resources".ProposalOption} proposalOption
     * @param {"resources".Profile} senderProfile
     * @param {"resources".Market} marketplace
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send( proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                       senderProfile: resources.Profile, marketplace: resources.Market): Promise<SmsgSendResponse> {

        const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal, proposalOption, senderProfile.address);

        if (proposal.type === ProposalType.ITEM_VOTE && proposal.expiredAt >= new Date().getTime()) {
            await this.createOrUpdateVote(voteMessage, proposal, 1);
            const proposalResult: resources.ProposalResult = await this.proposalService.recalculateProposalResult(proposal);
        }

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: voteMessage
        };

        const daysRetention = Math.ceil((proposal.expiredAt  - new Date().getTime()) / 1000 / 60 / 60 / 24);
        return this.smsgService.smsgSend(senderProfile.address, marketplace.address, msg, false, daysRetention);
    }

    /**
     * process received VoteMessage
     * - save ActionMessage
     * - create Proposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processVoteReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const voteMessage: VoteMessage = event.marketplaceMessage.mpaction as VoteMessage;
        if (voteMessage.voter !== event.smsgMessage.from) {
            throw new MessageException('Voter does not match with sender.');
        }

        // get proposal and ignore vote if we're past the final block of the proposal
        return await this.proposalService.findOneByHash(voteMessage.proposalHash)
            .then(async proposalModel => {

                const proposal: resources.Proposal = proposalModel.toJSON();

                // just make sure we have one
                if (_.isEmpty(proposal.ProposalResults)) {
                    throw new MessageException('ProposalResult should not be empty!');
                }

                // const currentBlock: number = await this.coreRpcService.getBlockCount();
                // this.log.debug('before update, proposal:', JSON.stringify(proposal, null, 2));

                if (voteMessage && event.smsgMessage.daysretention >= 1) {
                    const createdVote = await this.createOrUpdateVote(voteMessage, proposal, 1, event.smsgMessage);
                    this.log.debug('created/updated Vote:', JSON.stringify(createdVote, null, 2));

                    const proposalResult: resources.ProposalResult = await this.proposalService.recalculateProposalResult(proposal);

                    // todo: extract method
                    if (proposal.type === ProposalType.ITEM_VOTE
                        && await this.shouldRemoveListingItem(proposalResult)) {

                        // remove the ListingItem from the marketplace (unless user has Bid/Order related to it).
                        const listingItemId = await this.listingItemService.findOne(proposal.ListingItem.id, false)
                            .then(value => {
                                return value.Id;
                            }).catch(reason => {
                                // ignore
                                return null;
                            });
                        if (listingItemId) {
                            await this.listingItemService.destroy(listingItemId);
                        }
                    }
                    // TODO: do whatever else needs to be done

                    return SmsgMessageStatus.PROCESSED;
                } else {
                    throw new MessageException('Missing VoteMessage');
                }
            })
            .catch(reason => {
                return SmsgMessageStatus.WAITING;
            });

    }

    /**
     * todo: move to listingItemService
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    private async shouldRemoveListingItem(proposalResult: resources.ProposalResult): Promise<boolean> {
        const okOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 0;
        });
        const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 1; // 1 === REMOVE
        });

        // Requirements to remove the ListingItem from the testnet marketplace, these should also be configurable:
        // at minimum, a total of 10 votes
        // at minimum, 30% of votes saying remove

        if (removeOptionResult && okOptionResult && removeOptionResult.weight > 10
            && (removeOptionResult.weight / (removeOptionResult.weight + okOptionResult.weight) > 0.3)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param {VoteMessage} voteMessage
     * @param {"resources".Proposal} proposal
     * @param {number} weight
     * @param voteSmsgMessage
     * @returns {Promise<"resources".Vote>}
     */
    private async createOrUpdateVote(voteMessage: VoteMessage, proposal: resources.Proposal,
                                     weight: number, voteSmsgMessage?: resources.SmsgMessage): Promise<resources.Vote> {

        let lastVote: any;
        try {
            const lastVoteModel = await this.voteService.findOneByVoterAndProposalId(voteMessage.voter, proposal.id);
            lastVote = lastVoteModel.toJSON();
        } catch (ex) {
            lastVote = null;
        }
        const create: boolean = lastVote == null;

        // find the ProposalOption
        const proposalOption = _.find(proposal.ProposalOptions, (option: resources.ProposalOption) => {
            return option.optionId === voteMessage.optionId;
        });

        // this.log.debug('proposalOption:', JSON.stringify(proposalOption, null, 2));

        if (!proposalOption) {
            this.log.warn('ProposalOption ' + voteMessage.optionId + ' doesn\'t exists.');
            throw new MessageException('ProposalOption ' + voteMessage.optionId + ' doesn\'t exists.');
        }

        // create a vote
        const voteRequest = await this.voteFactory.getModel(voteMessage, proposal, proposalOption, weight, create, voteSmsgMessage);

        let voteModel;
        if (create) {
            // this.log.debug('Creating vote request = ' + JSON.stringify(voteRequest, null, 2));
            voteModel = await this.voteService.create(voteRequest);
        } else {
            // this.log.debug(`Updating vote with id = ${lastVote.id}, vote request = ` + JSON.stringify(voteRequest, null, 2));
            voteModel = await this.voteService.update(lastVote.id, voteRequest as VoteUpdateRequest);
            // this.voteService.destroy(lastVote.id);
            // voteModel = await this.voteService.create(voteRequest as VoteCreateRequest);
        }
        if (!voteModel) {
            this.log.error('VoteActionService.createOrUpdateVote(): Vote wasn\'t saved or updated properly. Return val is empty.');
            throw new MessageException('Vote wasn\'t saved or updated properly. Return val is empty.');
        }
        const vote = voteModel.toJSON();
        return vote;
    }

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners ');

        this.eventEmitter.on(Events.VoteReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processVoteReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('PROCESSING ERROR: ', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PARSING_FAILED);
                });
        });
    }
}
