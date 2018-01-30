/**
 * constants.Targets
 * ------------------------------------------------
 *
 * This is for our IOC so have a unique key/target for
 * our controllers, services and repositories
 *
 * This file is generated with the task `$ npm run console update:targets`.
 */

export const Targets = {
    Model:     {
        Address: 'Address',
        Bid: 'Bid',
        BidData: 'BidData',
        CryptocurrencyAddress: 'CryptocurrencyAddress',
        Escrow: 'Escrow',
        EscrowRatio: 'EscrowRatio',
        FavoriteItem: 'FavoriteItem',
        ItemCategory: 'ItemCategory',
        ItemImage: 'ItemImage',
        ItemImageData: 'ItemImageData',
        ItemInformation: 'ItemInformation',
        ItemLocation: 'ItemLocation',
        ItemPrice: 'ItemPrice',
        ListingItem: 'ListingItem',
        ListingItemObject: 'ListingItemObject',
        ListingItemTemplate: 'ListingItemTemplate',
        LocationMarker: 'LocationMarker',
        Market: 'Market',
        MessagingInformation: 'MessagingInformation',
        PaymentInformation: 'PaymentInformation',
        Profile: 'Profile',
        ShippingDestination: 'ShippingDestination',
        ShippingPrice: 'ShippingPrice',
        User: 'User'
    },
    Repository:     {
        AddressRepository: 'AddressRepository',
        BidDataRepository: 'BidDataRepository',
        BidRepository: 'BidRepository',
        CryptocurrencyAddressRepository: 'CryptocurrencyAddressRepository',
        EscrowRatioRepository: 'EscrowRatioRepository',
        EscrowRepository: 'EscrowRepository',
        FavoriteItemRepository: 'FavoriteItemRepository',
        ItemCategoryRepository: 'ItemCategoryRepository',
        ItemImageDataRepository: 'ItemImageDataRepository',
        ItemImageRepository: 'ItemImageRepository',
        ItemInformationRepository: 'ItemInformationRepository',
        ItemLocationRepository: 'ItemLocationRepository',
        ItemPriceRepository: 'ItemPriceRepository',
        ListingItemObjectRepository: 'ListingItemObjectRepository',
        ListingItemRepository: 'ListingItemRepository',
        ListingItemTemplateRepository: 'ListingItemTemplateRepository',
        LocationMarkerRepository: 'LocationMarkerRepository',
        MarketRepository: 'MarketRepository',
        MessagingInformationRepository: 'MessagingInformationRepository',
        PaymentInformationRepository: 'PaymentInformationRepository',
        ProfileRepository: 'ProfileRepository',
        ShippingDestinationRepository: 'ShippingDestinationRepository',
        ShippingPriceRepository: 'ShippingPriceRepository',
        UserRepository: 'UserRepository'
    },
    Service:     {
        AddressService: 'AddressService',
        BidDataService: 'BidDataService',
        BidService: 'BidService',
        CoreRpcService: 'CoreRpcService',
        CryptocurrencyAddressService: 'CryptocurrencyAddressService',
        DefaultItemCategoryService: 'DefaultItemCategoryService',
        DefaultMarketService: 'DefaultMarketService',
        DefaultProfileService: 'DefaultProfileService',
        EscrowRatioService: 'EscrowRatioService',
        EscrowService: 'EscrowService',
        FavoriteItemService: 'FavoriteItemService',
        ItemCategoryService: 'ItemCategoryService',
        ItemImageDataService: 'ItemImageDataService',
        ItemImageService: 'ItemImageService',
        ItemInformationService: 'ItemInformationService',
        ItemLocationService: 'ItemLocationService',
        ItemPriceService: 'ItemPriceService',
        ListingItemObjectService: 'ListingItemObjectService',
        ListingItemService: 'ListingItemService',
        ListingItemTemplateService: 'ListingItemTemplateService',
        LocationMarkerService: 'LocationMarkerService',
        MarketService: 'MarketService',
        MessageBroadcastService: 'MessageBroadcastService',
        MessagingInformationService: 'MessagingInformationService',
        PaymentInformationService: 'PaymentInformationService',
        ProfileService: 'ProfileService',
        ShippingDestinationService: 'ShippingDestinationService',
        ShippingPriceService: 'ShippingPriceService',
        TestDataService: 'TestDataService',
        UserService: 'UserService'
    },
    Command:     {
        address: {
            AddressCreateCommand: 'AddressCreateCommand',
            AddressListCommand: 'AddressListCommand',
            AddressRemoveCommand: 'AddressRemoveCommand',
            AddressRootCommand: 'AddressRootCommand',
            AddressUpdateCommand: 'AddressUpdateCommand'
        },
        admin: {
            AdminCommand: 'AdminCommand'
        },
        BaseCommand: 'BaseCommand',
        bid: {
            AcceptBidCommand: 'AcceptBidCommand',
            BidSearchCommand: 'BidSearchCommand',
            CancelBidCommand: 'CancelBidCommand',
            RejectBidCommand: 'RejectBidCommand',
            SendBidCommand: 'SendBidCommand'
        },
        Command: 'Command',
        CommandEnumType: 'CommandEnumType',
        data: {
            DataAddCommand: 'DataAddCommand',
            DataCleanCommand: 'DataCleanCommand',
            DataGenerateCommand: 'DataGenerateCommand',
            DataRootCommand: 'DataRootCommand'
        },
        escrow: {
            EscrowCreateCommand: 'EscrowCreateCommand',
            EscrowDestroyCommand: 'EscrowDestroyCommand',
            EscrowLockCommand: 'EscrowLockCommand',
            EscrowRefundCommand: 'EscrowRefundCommand',
            EscrowReleaseCommand: 'EscrowReleaseCommand',
            EscrowUpdateCommand: 'EscrowUpdateCommand'
        },
        favorite: {
            FavoriteAddCommand: 'FavoriteAddCommand',
            FavoriteListCommand: 'FavoriteListCommand',
            FavoriteRemoveCommand: 'FavoriteRemoveCommand',
            FavoriteRootCommand: 'FavoriteRootCommand'
        },
        HelpCommand: 'HelpCommand',
        itemcategory: {
            ItemCategoryListCommand: 'ItemCategoryListCommand',
            ItemCategoryAddCommand: 'ItemCategoryAddCommand',
            ItemCategoryFindCommand: 'ItemCategoryFindCommand',
            ItemCategoryGetCommand: 'ItemCategoryGetCommand',
            ItemCategoryRemoveCommand: 'ItemCategoryRemoveCommand',
            ItemCategoryUpdateCommand: 'ItemCategoryUpdateCommand',
            ItemCategoryRootCommand: 'ItemCategoryRootCommand'
        },
        itemimage: {
            ItemImageAddCommand: 'ItemImageAddCommand',
            ItemImageGetsCommand: 'ItemImageGetsCommand',
            ItemImageRemoveCommand: 'ItemImageRemoveCommand'
        },
        iteminformation: {
            ItemInformationCreateCommand: 'ItemInformationCreateCommand',
            ItemInformationGetCommand: 'ItemInformationGetCommand',
            ItemInformationUpdateCommand: 'ItemInformationUpdateCommand'
        },
        itemlocation: {
            ItemLocationCreateCommand: 'ItemLocationCreateCommand',
            ItemLocationRemoveCommand: 'ItemLocationRemoveCommand',
            ItemLocationUpdateCommand: 'ItemLocationUpdateCommand'
        },
        listingitem: {
            ListingItemGetCommand: 'ListingItemGetCommand',
            ListingItemSearchCommand: 'ListingItemSearchCommand',
            ListingItemUpdateCommand : 'ListingItemUpdateCommand',
            ListingItemRootCommand: 'ListingItemRootCommand'
        },
        listingitemtemplate: {
            ListingItemTemplateCreateCommand: 'ListingItemTemplateCreateCommand',
            ListingItemTemplateDestroyCommand: 'ListingItemTemplateDestroyCommand',
            ListingItemTemplateGetCommand: 'ListingItemTemplateGetCommand',
            ListingItemTemplateSearchCommand: 'ListingItemTemplateSearchCommand',
            ListingItemTemplatePostCommand: 'ListingItemTemplatePostCommand'
        },
        market: {
            MarketCreateCommand: 'MarketCreateCommand',
            MarketRootCommand: 'MarketRootCommand',
            MarketListCommand: 'MarketListCommand'
        },
        messaginginformation: {
            MessagingInformationUpdateCommand: 'MessagingInformationUpdateCommand'
        },
        paymentinformation: {
            PaymentInformationUpdateCommand: 'PaymentInformationUpdateCommand'
        },
        profile: {
            ProfileCreateCommand: 'ProfileCreateCommand',
            ProfileDestroyCommand: 'ProfileDestroyCommand',
            ProfileGetCommand: 'ProfileGetCommand',
            ProfileUpdateCommand: 'ProfileUpdateCommand',
            ProfileRootCommand: 'ProfileRootCommand',
            ProfileListCommand: 'ProfileListCommand'
        },
        RpcCommandInterface: 'RpcCommandInterface',
        shippingdestination: {
            ShippingDestinationAddCommand: 'ShippingDestinationAddCommand',
            ShippingDestinationRemoveCommand: 'ShippingDestinationRemoveCommand'
        }
    },
    Factory:     {
        BidFactory: 'BidFactory',
        EscrowFactory: 'EscrowFactory',
        ItemCategoryFactory: 'ItemCategoryFactory',
        ListingItemFactory: 'ListingItemFactory',
        MessagingInformationFactory: 'MessagingInformationFactory',
        RpcCommandFactory: 'RpcCommandFactory'
    },
    MessageProcessor:     {
        AcceptBidMessageProcessor: 'AcceptBidMessageProcessor',
        BidMessageProcessor: 'BidMessageProcessor',
        CancelBidMessageProcessor: 'CancelBidMessageProcessor',
        ListingItemMessageProcessor: 'ListingItemMessageProcessor',
        UpdateListingItemMessageProcessor: 'UpdateListingItemMessageProcessor',
        MessageProcessor: 'MessageProcessor',
        MessageProcessorInterface: 'MessageProcessorInterface',
        RejectBidMessageProcessor: 'RejectBidMessageProcessor',
        TestMessageProcessor: 'TestMessageProcessor'
    },
    Middleware:     {
        AuthenticateMiddleware: 'AuthenticateMiddleware',
        PopulateUserMiddleware: 'PopulateUserMiddleware',
        RestApiMiddleware: 'RestApiMiddleware',
        RpcMiddleware: 'RpcMiddleware'
    },
    Listener:     {
        ServerStartedListener: 'ServerStartedListener',
        user: {
            UserAuthenticatedListener: 'UserAuthenticatedListener',
            UserCreatedListener: 'UserCreatedListener'
        }
    },
    Controller:     {
        AddressController: 'AddressController',
        BidController: 'BidController',
        BidDataController: 'BidDataController',
        CryptocurrencyAddressController: 'CryptocurrencyAddressController',
        EscrowController: 'EscrowController',
        EscrowRatioController: 'EscrowRatioController',
        FavoriteItemController: 'FavoriteItemController',
        ItemCategoryController: 'ItemCategoryController',
        ItemImageController: 'ItemImageController',
        ItemImageDataController: 'ItemImageDataController',
        ItemInformationController: 'ItemInformationController',
        ItemLocationController: 'ItemLocationController',
        ItemPriceController: 'ItemPriceController',
        ListingItemController: 'ListingItemController',
        ListingItemObjectController: 'ListingItemObjectController',
        ListingItemTemplateController: 'ListingItemTemplateController',
        LocationMarkerController: 'LocationMarkerController',
        MarketController: 'MarketController',
        MessagingInformationController: 'MessagingInformationController',
        PaymentInformationController: 'PaymentInformationController',
        ProfileController: 'ProfileController',
        RpcController: 'RpcController',
        ShippingDestinationController: 'ShippingDestinationController',
        ShippingPriceController: 'ShippingPriceController',
        UserController: 'UserController'
    }
};
