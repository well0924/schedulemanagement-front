export interface CategoryRequest{
    name:string;
    parentId:number;
    depth:number;
}

export interface CategoryResponse{
    id: number;
    name: string;
    parentId: number;
    depth: number;
    createdBy: string;
    updatedBy: string;
    createdTime: Date;
    updatedTime: Date; 
}