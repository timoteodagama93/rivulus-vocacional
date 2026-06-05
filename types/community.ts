export type TopicStatus = 'suggestion' | 'voting' | 'active' | 'archived';
export type VoteStatus = 'open' | 'closed';

export interface Topic {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    authorRole?: 'professor' | 'aluno' | 'encarregado' | 'admin' | string;
    votes: number;
    status: TopicStatus;
    startDate?: any;
    endDate?: any;
    createdAt: any;
    updatedAt: any;
    tags: string[];
    commentsCount: number;
    isWeeklyWinner: boolean;
    weekNumber?: number;
    year?: number;
}

export interface CreateTopicDTO {
    title: string;
    description: string;
    tags?: string[];
}

export type UpdateTopicDTO = Partial<CreateTopicDTO>;

export interface Vote {
    id: string;
    topicId: string;
    teacherId: string;
    teacherName?: string;
    userId?: string;
    userRole?: 'professor' | 'aluno' | 'encarregado' | 'admin' | string;
    createdAt: any;
}

export interface Comment {
    id: string;
    topicId: string;
    authorId: string;
    authorName: string;
    authorRole?: 'professor' | 'aluno' | 'encarregado' | 'admin' | string;
    content: string;
    likes: number;
    replies: Reply[];
    createdAt: any;
    updatedAt: any;
}

export interface Reply {
    id: string;
    authorId: string;
    authorName: string;
    authorRole?: 'professor' | 'aluno' | 'encarregado' | 'admin' | string;
    content: string;
    likes: number;
    createdAt: any;
}

export interface CreateCommentDTO {
    content: string;
}

export interface CreateReplyDTO {
    content: string;
}

export interface WeeklyTopic {
    id: string;
    topicId: string;
    weekNumber: number;
    year: number;
    startDate: any;
    endDate: any;
    totalComments: number;
    createdAt: any;
}

export interface VotingPeriod {
    id: string;
    weekNumber: number;
    year: number;
    startDate: any;
    endDate: any;
    status: VoteStatus;
    topics: string[]; // IDs dos tópicos em votação
    winnerTopicId?: string;
    createdAt: any;
    updatedAt: any;
}
