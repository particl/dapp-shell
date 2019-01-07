// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ProposalMessage } from '../messages/ProposalMessage';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import * as resources from 'resources';
import {ProposalType} from '../enums/ProposalType';
import {ObjectHash} from '../../core/helpers/ObjectHash';
import {HashableObjectType} from '../enums/HashableObjectType';
import {ProposalCreateRequest} from '../requests/ProposalCreateRequest';
import {ProposalOptionCreateRequest} from '../requests/ProposalOptionCreateRequest';
import {MessageException} from '../exceptions/MessageException';

export class ProposalFactory {

    public log: LoggerType;

    constructor(@inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param proposalMessageType
     * @param proposalTitle
     * @param proposalDescription
     * @param options
     * @param senderProfile
     * @param {string} itemHash
     * @returns {Promise<BidMessage>}
     */
    public async getMessage(proposalMessageType: ProposalMessageType, proposalTitle: string,
                            proposalDescription: string, options: string[],
                            senderProfile: resources.Profile, itemHash: string | null = null): Promise<ProposalMessage> {

        const submitter = senderProfile.address;

        const optionsList: any[] = [];
        let optionId = 0;

        for (const description of options) {
            const option = {
                optionId,
                description
            };
            optionsList.push(option);
            optionId++;
        }

        let proposalType = ProposalType.PUBLIC_VOTE;
        if (itemHash) {
            proposalType = ProposalType.ITEM_VOTE;
        }

        const message: ProposalMessage = {
            action: proposalMessageType,
            submitter,
            title: proposalTitle,
            description: proposalDescription,
            options: optionsList,
            type: proposalType,
            item: itemHash
        } as ProposalMessage;

        message.hash = ObjectHash.getHash(message, HashableObjectType.PROPOSAL_MESSAGE);

        // add hashes for the options too
        for (const option of message.options) {
            option.proposalHash = message.hash;
            option.hash = ObjectHash.getHash(option, HashableObjectType.PROPOSALOPTION_CREATEREQUEST);
        }
        return message;
    }

    /**
     *
     * @param {ProposalMessage} proposalMessage
     * @param smsgMessage
     * @returns {Promise<ProposalCreateRequest>}
     */
    public async getModel(proposalMessage: ProposalMessage, smsgMessage?: resources.SmsgMessage): Promise<ProposalCreateRequest> {

        const smsgData: any = {
            postedAt: Number.MAX_SAFE_INTEGER,
            expiredAt: Number.MAX_SAFE_INTEGER,
            receivedAt: Number.MAX_SAFE_INTEGER,
            timeStart: Number.MAX_SAFE_INTEGER
        };

        if (smsgMessage) {
            smsgData.postedAt = smsgMessage.sent;
            smsgData.receivedAt = smsgMessage.received;
            smsgData.expiredAt = smsgMessage.expiration;
            smsgData.timeStart = smsgMessage.sent;
        }

        const proposalCreateRequest = {
            submitter: proposalMessage.submitter,
            hash: proposalMessage.hash,
            type: proposalMessage.type,
            title: proposalMessage.title,
            description: proposalMessage.description,
            item: proposalMessage.item,
            options: proposalMessage.options as ProposalOptionCreateRequest[],
            ...smsgData
        } as ProposalCreateRequest;

        const correctHash = ObjectHash.getHash(proposalCreateRequest, HashableObjectType.PROPOSAL_CREATEREQUEST);
        if (correctHash !== proposalCreateRequest.hash) {
            throw new MessageException(`Received proposal hash <${proposalCreateRequest.hash}> doesn't match actual hash <${correctHash}>.`);
        }

        return proposalCreateRequest;
    }

}
