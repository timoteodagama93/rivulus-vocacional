export type ResourceType = 'lesson_plan' | 'fortnightly_plan' | 'worksheet' | 'presentation' | 'book' | 'video' | 'audio' | 'other';

export type ResourceStatus = 'active' | 'archived';

export interface Resource {
    id: string;
    title: string;
    type: ResourceType;
    description?: string;
    discipline: string;
    class: string;
    tags: string[];
    authorId: string;
    authorName: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    thumbnailUrl?: string;
    downloadCount: number;
    favoriteCount: number;
    viewCount: number;
    status: ResourceStatus;
    createdAt: any;
    updatedAt: any;
}

export interface CreateResourceDTO {
    title: string;
    type: ResourceType;
    discipline: string;
    class: string;
    description?: string;
    tags?: string[];
    fileUri: string; // URI local do arquivo
    fileName: string;
    fileSize: number;
    fileType: string;
    thumbnailUri?: string; // URI local da thumbnail (opcional)
}

export type UpdateResourceDTO = Partial<Omit<CreateResourceDTO, 'fileUri' | 'fileName' | 'fileSize' | 'fileType'>>;

export interface Favorite {
    id: string;
    resourceId: string;
    teacherId: string;
    createdAt: any;
}