export enum HashableProposalAddField {
    PROPOSAL_SUBMITTER = 'proposalSubmitter',
    PROPOSAL_CATEGORY = 'proposalCategory',
    PROPOSAL_TITLE = 'proposalTitle',
    PROPOSAL_DESCRIPTION = 'proposalDescription',
    PROPOSAL_ITEM = 'proposalItem',
    PROPOSAL_OPTIONS = 'proposalOptions'
}

export enum HashableProposalOptionField {
    PROPOSALOPTION_OPTION_ID = 'proposalOptionId',
    PROPOSALOPTION_DESCRIPTION = 'proposalOptionDescription'
}

export declare enum HashableOrderField {
    ORDER_BUYER = 'orderBuyer',
    ORDER_SELLER = 'orderSeller'
}

export enum HashableBidReleaseField {
    BID_HASH = 'bidHash'
}

// TODO: fix this overwrite!!!
// export type HashableFieldTypesMarketplace = HashableCommonField | HashableItemField | HashableBidField | HashableOrderField;
// interface HashableFieldConfigExtension {
//    to: HashableFieldTypesMarketplace;
// }
// interface HashableFieldConfigExtended extends Overwrite<HashableFieldConfig, HashableFieldConfigExtension> {}

export enum HashableItemImageField {
    IMAGE_DATA = 'itemImageData'
}

