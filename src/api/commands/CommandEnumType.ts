// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Enum, EnumValue } from 'ts-enums';
import { Command } from './Command';
import { EnvironmentType } from '../../core/helpers/Environment';

export class CommandEnumType extends Enum<Command> {

    public DAEMON_ROOT: Command     = new Command('daemon', 'daemon', true, [], EnvironmentType.ALL);
    public HELP_ROOT: Command       = new Command('help', 'help', true, [], EnvironmentType.ALL);

    public DATA_ADD: Command        = new Command('dataadd', 'add', false);
    public DATA_GENERATE: Command   = new Command('datagenerate', 'generate', false);
    public DATA_CLEAN: Command      = new Command('dataclean', 'clean', false);
    public DATA_ROOT: Command       = new Command('data', 'data', true,
        [this.DATA_ADD, this.DATA_GENERATE, this.DATA_CLEAN], EnvironmentType.DEVELOPMENT);

    // public ADMIN_DATA: Command    = new Command('admindata', 'data', true); // link to root
    public ADMIN_ROOT: Command      = new Command('admin', 'admin', true,
        [this.DATA_ROOT], EnvironmentType.DEVELOPMENT);

    public BID_SEARCH: Command      = new Command('bidsearch', 'search', false);
    public BID_ACCEPT: Command      = new Command('bidaccept', 'accept', false);
    public BID_CANCEL: Command      = new Command('bidcancel', 'cancel', false);
    public BID_REJECT: Command      = new Command('bidreject', 'reject', false);
    public BID_SEND: Command        = new Command('bidsend', 'send', false);
    public BID_ROOT: Command        = new Command('bid', 'bid', true,
        [this.BID_SEARCH, this.BID_ACCEPT, this.BID_CANCEL, this.BID_REJECT, this.BID_SEND], EnvironmentType.ALL);

    public ITEM_SEARCH: Command         = new Command('itemsearch', 'search', false);
    public ITEM_GET: Command            = new Command('itemget', 'get', false);
    public ITEM_POST_UPDATE: Command    = new Command('itempostupdate', 'update', false);
    public ITEM_FLAG: Command           = new Command('itemflag', 'flag', false);
    public ITEM_ROOT: Command           = new Command('item', 'item', true,
        [this.ITEM_SEARCH, this.ITEM_GET, this.ITEM_POST_UPDATE, this.ITEM_FLAG], EnvironmentType.ALL);

    public ESCROW_ADD: Command      = new Command('escrowadd', 'add', false);
    public ESCROW_UPDATE: Command   = new Command('escrowupdate', 'update', false);
    public ESCROW_REMOVE: Command   = new Command('escrowremove', 'remove', false);
    public ESCROW_LOCK: Command     = new Command('escrowlock', 'lock', false);
    public ESCROW_REFUND: Command   = new Command('escrowrefund', 'refund', false);
    public ESCROW_RELEASE: Command  = new Command('escrowrelease', 'release', false);
    public ESCROW_ROOT: Command     = new Command('escrow', 'escrow', true,
        [this.ESCROW_ADD, this.ESCROW_UPDATE, this.ESCROW_REMOVE, this.ESCROW_LOCK, this.ESCROW_REFUND, this.ESCROW_RELEASE], EnvironmentType.ALL);

    public PAYMENTINFORMATION_UPDATE: Command   = new Command('paymentinformationupdate', 'update', false);
    public PAYMENTINFORMATION_ROOT: Command     = new Command('paymentinformation', 'payment', true,
        [this.PAYMENTINFORMATION_UPDATE], EnvironmentType.ALL);

    public MESSAGINGINFORMATION_UPDATE: Command = new Command('messaginginformationupdate', 'update', false);
    public MESSAGINGINFORMATION_ROOT: Command   = new Command('messaginginformation', 'messaging', true,
        [this.MESSAGINGINFORMATION_UPDATE], EnvironmentType.ALL);

    public SHIPPINGDESTINATION_LIST: Command    = new Command('shippingdestinationlist', 'list', false);
    public SHIPPINGDESTINATION_ADD: Command     = new Command('shippingdestinationadd', 'add', false);
    public SHIPPINGDESTINATION_REMOVE: Command  = new Command('shippingdestinationremove', 'remove', false);
    public SHIPPINGDESTINATION_ROOT: Command    = new Command('shippingdestination', 'shipping', true,
        [this.SHIPPINGDESTINATION_LIST, this.SHIPPINGDESTINATION_ADD, this.SHIPPINGDESTINATION_REMOVE], EnvironmentType.ALL);

    public ITEMLOCATION_ADD: Command        = new Command('itemlocationadd', 'add', false);
    public ITEMLOCATION_UPDATE: Command     = new Command('itemlocationupdate', 'update', false);
    public ITEMLOCATION_REMOVE: Command     = new Command('itemlocationremove', 'remove', false);
    public ITEMLOCATION_ROOT: Command       = new Command('itemlocation', 'location', true,
        [this.ITEMLOCATION_ADD, this.ITEMLOCATION_UPDATE, this.ITEMLOCATION_REMOVE], EnvironmentType.ALL);

    public ITEMIMAGE_LIST: Command          = new Command('itemimagelist', 'list', false);
    public ITEMIMAGE_ADD: Command           = new Command('itemimageadd', 'add', false);
    public ITEMIMAGE_REMOVE: Command        = new Command('itemimageremove', 'remove', false);
    public ITEMIMAGE_ROOT: Command          = new Command('itemimage', 'image', true,
        [this.ITEMIMAGE_LIST, this.ITEMIMAGE_ADD, this.ITEMIMAGE_REMOVE], EnvironmentType.ALL);

    public ITEMINFORMATION_GET: Command    = new Command('iteminformationget', 'get', false);
    public ITEMINFORMATION_UPDATE: Command  = new Command('iteminformationupdate', 'update', false);
    public ITEMINFORMATION_ROOT: Command    = new Command('iteminformation', 'information', true,
        [this.ITEMINFORMATION_GET, this.ITEMINFORMATION_UPDATE], EnvironmentType.ALL);

    public TEMPLATE_SEARCH: Command         = new Command('templatesearch', 'search', false);
    public TEMPLATE_GET: Command            = new Command('templateget', 'get', false);
    public TEMPLATE_ADD: Command            = new Command('templateadd', 'add', false);
    public TEMPLATE_REMOVE: Command         = new Command('templateremove', 'remove', false);
    public TEMPLATE_POST: Command           = new Command('templatepost', 'post', false);
    public TEMPLATE_IMPORT: Command         = new Command('templateimport', 'import', false);
    public TEMPLATE_ROOT: Command           = new Command('template', 'template', true,
        [this.TEMPLATE_SEARCH, this.TEMPLATE_GET, this.TEMPLATE_ADD, this.TEMPLATE_REMOVE, this.TEMPLATE_POST, this.TEMPLATE_IMPORT,
            this.ITEMINFORMATION_ROOT, this.ITEMIMAGE_ROOT, this.ITEMLOCATION_ROOT, this.SHIPPINGDESTINATION_ROOT,
            this.MESSAGINGINFORMATION_ROOT, this.PAYMENTINFORMATION_ROOT, this.ESCROW_ROOT], EnvironmentType.ALL);

    public CATEGORY_LIST: Command       = new Command('categorylist', 'list', false);
    public CATEGORY_GET: Command        = new Command('categoryget', 'get', false);
    public CATEGORY_ADD: Command        = new Command('categoryadd', 'add', false);
    public CATEGORY_UPDATE: Command     = new Command('categoryupdate', 'update', false);
    public CATEGORY_REMOVE: Command     = new Command('categoryremove', 'remove', false);
    public CATEGORY_SEARCH: Command     = new Command('categorysearch', 'search', false);
    public CATEGORY_ROOT: Command       = new Command('category', 'category', true,
        [this.CATEGORY_LIST, this.CATEGORY_GET, this.CATEGORY_ADD, this.CATEGORY_UPDATE, this.CATEGORY_REMOVE, this.CATEGORY_SEARCH], EnvironmentType.ALL);

    public FAVORITE_LIST: Command       = new Command('favoritelist', 'list', false);
    public FAVORITE_ADD: Command        = new Command('favoriteadd', 'add', false);
    public FAVORITE_REMOVE: Command     = new Command('favoriteremove', 'remove', false);
    public FAVORITE_ROOT: Command       = new Command('favorite', 'favorite', true,
        [this.FAVORITE_LIST, this.FAVORITE_ADD, this.FAVORITE_REMOVE], EnvironmentType.ALL);

    public ADDRESS_LIST: Command        = new Command('addresslist', 'list', false);
    public ADDRESS_ADD: Command         = new Command('addressadd', 'add', false);
    public ADDRESS_UPDATE: Command      = new Command('addressupdate', 'update', false);
    public ADDRESS_REMOVE: Command      = new Command('addressremove', 'remove', false);
    public ADDRESS_ROOT: Command        = new Command('address', 'address', true,
        [this.ADDRESS_LIST, this.ADDRESS_ADD, this.ADDRESS_UPDATE, this.ADDRESS_REMOVE], EnvironmentType.ALL);

    public PROFILE_LIST: Command        = new Command('profilelist', 'list', false);
    public PROFILE_GET: Command         = new Command('profileget', 'get', false);
    public PROFILE_ADD: Command         = new Command('profileadd', 'add', false);
    public PROFILE_UPDATE: Command      = new Command('profileupdate', 'update', false);
    public PROFILE_REMOVE: Command      = new Command('profileremove', 'remove', false);
    // public PROFILE_ADDRESS: Command     = new Command('profileaddress', 'address', true);      // link to root
    // public PROFILE_FAVORITE: Command    = new Command('profilefavorite', 'favorite', true);    // link to root
    public PROFILE_ROOT: Command        = new Command('profile', 'profile', true,
        [this.PROFILE_LIST, this.PROFILE_GET, this.PROFILE_ADD, this.PROFILE_UPDATE, this.PROFILE_REMOVE,
            this.ADDRESS_ROOT, this.FAVORITE_ROOT], EnvironmentType.ALL);

    public PROPOSAL_GET: Command         = new Command('proposalget', 'get', false);
    public PROPOSAL_POST: Command        = new Command('proposalpost', 'post', false);
    public PROPOSAL_LIST: Command        = new Command('proposallist', 'list', false);
    public PROPOSAL_RESULT: Command      = new Command('proposalresult', 'result', false);
    public PROPOSAL_ROOT: Command        = new Command('proposal', 'proposal', true,
        [this.PROPOSAL_GET, this.PROPOSAL_POST, this.PROPOSAL_LIST, this.PROPOSAL_RESULT], EnvironmentType.ALL);

    public MARKET_LIST: Command         = new Command('marketlist', 'list', false);
    public MARKET_ADD: Command          = new Command('marketadd', 'add', false);
    public MARKET_ROOT: Command         = new Command('market', 'market', true,
        [this.MARKET_LIST, this.MARKET_ADD], EnvironmentType.ALL);

    public SHOPPINGCART_LIST: Command   = new Command('cartlist', 'list', false);
    public SHOPPINGCART_GET: Command    = new Command('cartget', 'get', false);
    public SHOPPINGCART_ADD: Command    = new Command('cartadd', 'add', false);
    public SHOPPINGCART_UPDATE: Command = new Command('cartupdate', 'update', false);
    public SHOPPINGCART_REMOVE: Command = new Command('cartremove', 'remove', false);
    public SHOPPINGCART_CLEAR: Command  = new Command('cartclear', 'clear', false);
    public SHOPPINGCART_ROOT: Command   = new Command('cart', 'cart', true,
        [this.SHOPPINGCART_LIST, this.SHOPPINGCART_GET, this.SHOPPINGCART_ADD, this.SHOPPINGCART_UPDATE,
            this.SHOPPINGCART_REMOVE, this.SHOPPINGCART_CLEAR], EnvironmentType.ALL);

    public SHOPPINGCARTITEM_LIST: Command   = new Command('cartitemlist', 'list', false);
    public SHOPPINGCARTITEM_ADD: Command    = new Command('cartitemadd', 'add', false);
    public SHOPPINGCARTITEM_REMOVE: Command = new Command('cartitemremove', 'remove', false);
    public SHOPPINGCARTITEM_ROOT: Command   = new Command('cartitem', 'cartitem', true,
        [this.SHOPPINGCARTITEM_LIST, this.SHOPPINGCARTITEM_ADD, this.SHOPPINGCARTITEM_REMOVE], EnvironmentType.ALL);

    public ITEMOBJECT_SEARCH: Command         = new Command('itemobjectsearch', 'search', false);
    public ITEMOBJECT_ROOT: Command           = new Command('itemobject', 'itemobject', true,
        [this.ITEMOBJECT_SEARCH], EnvironmentType.ALL);

    public ORDER_SEARCH: Command         = new Command('ordersearch', 'search', false);
    public ORDER_ROOT: Command           = new Command('order', 'order', true,
        [this.ORDER_SEARCH], EnvironmentType.ALL);

    public ORDERITEM_STATUS: Command         = new Command('orderitemstatus', 'status', false);
    public ORDERITEM_ROOT: Command           = new Command('orderitem', 'orderitem', true,
        [this.ORDERITEM_STATUS], EnvironmentType.ALL);

    public PRICETICKER_ROOT: Command           = new Command('priceticker', 'priceticker', true);

    public CURRENCYPRICE_ROOT: Command        = new Command('currencyprice', 'currencyprice', true);

    public VOTE_POST: Command         = new Command('votepost', 'post', false);
    public VOTE_GET: Command         = new Command('voteget', 'get', false);
    public VOTE_LIST: Command         = new Command('votelist', 'list', false);
    public VOTE_ROOT: Command           = new Command('vote', 'vote', true,
        [this.VOTE_POST, this.VOTE_GET, this.VOTE_LIST], EnvironmentType.ALL);

    public SMSG_SEARCH: Command      = new Command('smsgsearch', 'search', false);
    public SMSG_ROOT: Command        = new Command('smsg', 'smsg', true,
        [this.SMSG_SEARCH], EnvironmentType.ALL);

    public SETTING_REMOVE: Command         = new Command('settingremove', 'remove', false);
    public SETTING_GET: Command         = new Command('settingget', 'get', false);
    public SETTING_LIST: Command         = new Command('settinglist', 'list', false);
    public SETTING_SET: Command           = new Command('settingset', 'set', false);
    public SETTING_ROOT: Command           = new Command('setting', 'setting', true,
        [this.SETTING_REMOVE, this.SETTING_GET, this.SETTING_LIST, this.SETTING_SET], EnvironmentType.ALL);


    constructor() {
        super();
        this.initEnum('Command');
    }

    get rootCommands(): Command[] {
        const rootCommands: Command[] = [];
        for (const cmd of this.values) {
            if (cmd.isRoot) {
                // if (cmd.commandType === EnvironmentType.ALL || (nodeEnv ? nodeEnv.toUpperCase() === cmd.commandType : true)) {
                rootCommands.push(cmd);
                // }
            }
        }
        return rootCommands;
    }

}

export const Commands: CommandEnumType = new CommandEnumType();
