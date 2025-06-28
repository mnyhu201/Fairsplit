export interface Group {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users?: UserInGroup[];
}

export interface CreateGroupRequest {
    name: string;
    is_active?: boolean;
}

export interface UpdateGroupRequest {
    name?: string;
    is_active?: boolean;
}

export interface GroupWithUsers extends Group {
    users: UserInGroup[];
}

export interface UserInGroup {
    id: string;
    username: string;
    fullname: string;
    email: string;
    is_active: boolean;
    joined_at: string;
}

export interface GroupMembership {
    group_id: number;
    user_id: string;
    joined_at: string;
}

export interface AddUserToGroupRequest {
    userId: string;
}

export interface RemoveUserFromGroupRequest {
    userId: string;
} 