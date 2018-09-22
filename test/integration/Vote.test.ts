// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Vote } from '../../src/api/models/Vote';
import { VoteService } from '../../src/api/services/VoteService';
import { VoteCreateRequest } from '../../src/api/requests/VoteCreateRequest';
import { VoteUpdateRequest } from '../../src/api/requests/VoteUpdateRequest';
import { ProposalType } from '../../src/api/enums/ProposalType';
import { ProposalCreateRequest } from '../../src/api/requests/ProposalCreateRequest';
import { Proposal } from '../../src/api/models/Proposal';
import { ProposalService } from '../../src/api/services/ProposalService';
import * as resources from 'resources';

describe('Vote', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let voteService: VoteService;
    let proposalService: ProposalService;

    let createdId;
    let createdProposal: resources.Proposal;

    const testData = {
        // proposal_option_id: 0,
        voter: 'voteraddress1',
        block: 1,
        weight: 1
    } as VoteCreateRequest;

    const testDataUpdated = {
        voter: 'voteraddress2',
        block: 2,
        weight: 2
    } as VoteUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        voteService = app.IoC.getNamed<VoteService>(Types.Service, Targets.Service.VoteService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.ProposalService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const proposalOptions = [{
            optionId: 0,
            // hash: 'asdf',
            description: 'Yes'
        }, {
            optionId: 1,
            // hash: 'asdf',
            description: 'No'
        }];

        // create proposal
        const proposalTestData = {
            submitter: 'psubmitter',
            blockStart: 1000,
            blockEnd: 1010,
            // hash: 'asdf',
            type: ProposalType.PUBLIC_VOTE,
            title: 'titlex',
            description: 'proposal to x',
            options: proposalOptions
        } as ProposalCreateRequest;

        const proposalModel: Proposal = await proposalService.create(proposalTestData);
        createdProposal = proposalModel.toJSON();

        log.debug('createdProposal:', JSON.stringify(createdProposal, null, 2));

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await voteService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because we want to create a empty vote', async () => {
        expect.assertions(1);
        await voteService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new vote', async () => {
        testData.proposal_option_id = createdProposal.ProposalOptions[0].id;

        const voteModel: Vote = await voteService.create(testData);
        createdId = voteModel.Id;

        const result = voteModel.toJSON();

        // test the values
        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });

    test('Should list votes with our new create one', async () => {
        const voteCollection = await voteService.findAll();
        const vote = voteCollection.toJSON();
        expect(vote.length).toBe(1);

        const result = vote[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });

    test('Should return one vote', async () => {
        const voteModel: Vote = await voteService.findOne(createdId);
        const result = voteModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testData.voter);
        expect(result.block).toBe(testData.block);
        expect(result.weight).toBe(testData.weight);
    });


    test('Should get a vote by proposal id and voter address', async () => {

        const voter = 'voteraddress2';
        // create another vote
        const anotherVoteCreateRequest = {
            proposal_option_id: createdProposal.ProposalOptions[0].id,
            voter,
            block: 1,
            weight: 1
        } as VoteCreateRequest;
        const anotherVoteModel: Vote = await voteService.create(anotherVoteCreateRequest);

        const voteModel: Vote = await voteService.findOneByVoterAndProposal(voter, createdProposal.id);
        const result = voteModel.toJSON();

        // test the values
        expect(result).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.ProposalOption.optionId).toBe(createdProposal.ProposalOptions[0].optionId);
        expect(result.voter).toBe(anotherVoteCreateRequest.voter);
        expect(result.block).toBe(anotherVoteCreateRequest.block);
        expect(result.weight).toBe(anotherVoteCreateRequest.weight);
    });

    test('Should update the vote', async () => {
        const voteModel: Vote = await voteService.update(createdId, testDataUpdated);
        const result = voteModel.toJSON();

        // test the values
        expect(result.ProposalOption).toBeDefined();
        expect(result.ProposalOption.id).toBe(createdProposal.ProposalOptions[0].id);
        expect(result.voter).toBe(testDataUpdated.voter);
        expect(result.block).toBe(testDataUpdated.block);
        expect(result.weight).toBe(testDataUpdated.weight);
    });

    test('Should delete the vote', async () => {
        expect.assertions(1);
        await voteService.destroy(createdId);
        await voteService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
