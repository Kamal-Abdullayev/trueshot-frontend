export enum RewardType {
    TOP_USER = 'TOP_USER',
    LOOSER = 'LOOSER',
    DRAMA_QUEEN = 'DRAMA_QUEEN',
    HA_HA_HA = 'HA_HA_HA'
}

export interface Reward {
    id: string;
    type: RewardType;
    description: string;
}

export interface UserPoints {
    points: number;
} 