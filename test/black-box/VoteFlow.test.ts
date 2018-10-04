// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import * as Faker from 'faker';
import * as resources from 'resources';

describe('Happy Vote Flow', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtilNode1 = new BlackBoxTestUtil(randomBoolean ? 0 : 1);
    const testUtilNode2 = new BlackBoxTestUtil(randomBoolean ? 1 : 0);
    // const testUtilNode1 = new BlackBoxTestUtil(0);
    // const testUtilNode2 = new BlackBoxTestUtil(1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const voteCommand = Commands.VOTE_ROOT.commandName;
    const votePostCommand = Commands.VOTE_POST.commandName;
    const voteGetCommand = Commands.VOTE_GET.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let profileNode1: resources.Profile;
    let profileNode2: resources.Profile;
    let marketNode1: resources.Market;
    let marketNode2: resources.Market;

    let proposalNode1: resources.Proposal;
    let proposalNode2: resources.Proposal;

    let currentBlock: number;
    const estimateFee = false;
    const proposalTitle = Faker.lorem.words();
    const proposalDescription = Faker.lorem.paragraph();

    let sent = true;

    beforeAll(async () => {

        // await testUtilNode0.cleanDb();
        await testUtilNode1.cleanDb();
        await testUtilNode2.cleanDb();

        profileNode1 = await testUtilNode1.getDefaultProfile();
        profileNode2 = await testUtilNode2.getDefaultProfile();
        expect(profileNode1.id).toBeDefined();
        expect(profileNode2.id).toBeDefined();
        log.debug('profileNode1: ', profileNode1.id);
        log.debug('profileNode2: ', profileNode2.id);

        marketNode1 = await testUtilNode1.getDefaultMarket();
        marketNode2 = await testUtilNode2.getDefaultMarket();
        expect(marketNode1.id).toBeDefined();
        expect(marketNode2.id).toBeDefined();
        log.debug('marketNode1: ', JSON.stringify(marketNode1, null, 2));
        log.debug('marketNode2: ', JSON.stringify(marketNode2, null, 2));

        const currentBlockRes: any = await testUtilNode1.rpc(daemonCommand, ['getblockcount']);
        currentBlockRes.expectStatusCode(200);
        currentBlock = currentBlockRes.getBody()['result'];
        log.debug('currentBlock:', currentBlock);
    });

    test('Post Proposal from node1', async () => {

        log.debug('========================================================================================');
        log.debug('Node1 POSTS MP_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(5);

        const blockStart = currentBlock;
        const blockEnd = currentBlock + 10;

        const response: any = await testUtilNode1.rpc(proposalCommand, [
            proposalPostCommand,
            profileNode1.id,
            proposalTitle,
            proposalDescription,
            blockStart,
            blockEnd,
            estimateFee,
            'YES',
            'NO'
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toEqual('Sent.');

    });

    test('Receive Proposal on node1', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MP_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(5);

        const response = await testUtilNode1.rpcWaitFor(proposalCommand,
            [proposalListCommand, '*', '*'],
            30 * 60,            // maxSeconds
            200,            // waitForStatusCode
            '[0].title', // property name
            proposalTitle                   // value
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'][0];
        expect(result.title).toBe(proposalTitle);
        expect(result.description).toBe(proposalDescription);

        // store Proposal for later tests
        proposalNode1 = result;

    }, 600000); // timeout to 600s

    test('Receive Proposal on node2', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MP_PROPOSAL_ADD');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(5);

        const response = await testUtilNode2.rpcWaitFor(proposalCommand,
            [proposalGetCommand, proposalNode1.hash],
            30 * 60,            // maxSeconds
            200,            // waitForStatusCode
            'hash',     // property name
            proposalNode1.hash                   // value
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Proposal = response.getBody()['result'];
        expect(result.title).toBe(proposalNode1.title);
        expect(result.description).toBe(proposalNode1.description);
        expect(result.blockStart).toBe(proposalNode1.blockStart);
        expect(result.blockEnd).toBe(proposalNode1.blockEnd);
        expect(result.ProposalOptions[0].description).toBe(proposalNode1.ProposalOptions[0].description);
        expect(result.ProposalOptions[1].description).toBe(proposalNode1.ProposalOptions[1].description);

        // store Proposal for later tests
        proposalNode2 = result;

    }, 600000); // timeout to 600s

    test('Post Vote1 from node1', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node1 POSTS MP_VOTE_ADD (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpc(voteCommand, [
            votePostCommand,
            profileNode1.id,
            proposalNode1.hash,
            proposalNode1.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');

        // update currentBlock
        const currentBlockRes: any = await testUtilNode1.rpc(daemonCommand, ['getblockcount']);
        currentBlockRes.expectStatusCode(200);
        currentBlock = currentBlockRes.getBody()['result'];
        log.debug('currentBlock:', currentBlock);

    });

    test('Receive Vote1 on node1', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MP_VOTE_ADD (confirm with: vote get)');
        log.debug('========================================================================================');

        await testUtilNode1.waitFor(3);

        const response: any = await testUtilNode1.rpcWaitFor(
            voteCommand,
            [voteGetCommand, profileNode1.id, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalNode1.ProposalOptions[0].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.block).toBeGreaterThanOrEqual(currentBlock);
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(profileNode1.address);
        expect(result.ProposalOption.optionId).toBe(proposalNode1.ProposalOptions[0].optionId);
    });

    test('Receive Vote1 on node2', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MP_VOTE_ADD (confirm with: proposal result)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            1
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(1);
        expect(result.ProposalOptionResults[0].weight).toBe(1);
    });

    test('Post Vote2 from node2', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node2 POSTS MP_VOTE_ADD (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpc(voteCommand, [
            votePostCommand,
            profileNode2.id,
            proposalNode2.hash,
            proposalNode2.ProposalOptions[0].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');

        // update currentBlock
        const currentBlockRes: any = await testUtilNode1.rpc(daemonCommand, ['getblockcount']);
        currentBlockRes.expectStatusCode(200);
        currentBlock = currentBlockRes.getBody()['result'];
        log.debug('currentBlock:', currentBlock);
    });

    test('Receive Vote2 on node2', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MP_VOTE_ADD (confirm with: vote get)');
        log.debug('========================================================================================');

        await testUtilNode2.waitFor(3);

        const response: any = await testUtilNode2.rpcWaitFor(
            voteCommand,
            [voteGetCommand, profileNode2.id, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOption.optionId',
            proposalNode2.ProposalOptions[0].optionId
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: resources.Vote = response.getBody()['result'];
        expect(result).hasOwnProperty('ProposalOption');
        expect(result.block).toBeGreaterThanOrEqual(currentBlock);
        expect(result.weight).toBe(1);
        expect(result.voter).toBe(profileNode2.address);
        expect(result.ProposalOption.optionId).toBe(proposalNode2.ProposalOptions[0].optionId);
    });

    test('Receive Vote2 on node1', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node1 RECEIVES MP_VOTE_ADD (confirm with: proposal result)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode1.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode1.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            2
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(2);
        expect(result.ProposalOptionResults[0].weight).toBe(2);
        expect(result.ProposalOptionResults[1].voters).toBe(0);
        expect(result.ProposalOptionResults[1].weight).toBe(0);
    });

    // right now we have 2 votes for optionId=0 on both nodes
    // default profiles on both nodes have voted

    test('Post Vote2 again from node2 changing the vote optionId', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node2 POSTS MP_VOTE_ADD (default profile)');
        log.debug('========================================================================================');

        const response: any = await testUtilNode2.rpc(voteCommand, [
            votePostCommand,
            profileNode2.id,
            proposalNode2.hash,
            proposalNode2.ProposalOptions[1].optionId
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Receive Vote2 on node2 again', async () => {

        expect(sent).toEqual(true);

        log.debug('========================================================================================');
        log.debug('Node2 RECEIVES MP_VOTE_ADD (confirm with: proposal result)');
        log.debug('========================================================================================');

        // lets wait for some time to receive the vote otherwise rpcWaitFor will return the previous result
        await testUtilNode2.waitFor(5);

        const response: any = await testUtilNode2.rpcWaitFor(
            proposalCommand,
            [proposalResultCommand, proposalNode2.hash],
            8 * 60,
            200,
            'ProposalOptionResults[0].voters',
            1
        );
        response.expectJson();
        response.expectStatusCode(200);

        const result: any = response.getBody()['result'];
        expect(result).hasOwnProperty('Proposal');
        expect(result).hasOwnProperty('ProposalOptionResults');
        expect(result.ProposalOptionResults[0].voters).toBe(1);
        expect(result.ProposalOptionResults[0].weight).toBe(1);
        expect(result.ProposalOptionResults[1].voters).toBe(1);
        expect(result.ProposalOptionResults[1].weight).toBe(1);
    });

});
