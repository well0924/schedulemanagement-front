import { CategoryRequest, CategoryResponse } from "@/app/interfaces/category/category";
import { fetcher } from "./fetcher";

//카테고리 목록
export async function getCategoryList() {
    return fetcher<CategoryResponse[]>("/api/category/", {
        method: "GET",
    });
}

//카테고리 추가
export async function CategoryCreate(data: CategoryRequest): Promise<CategoryResponse> {
    return fetcher<CategoryResponse>("/api/category/", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

//카테고리 수정
export async function CategoryUpdate(id: number, data: CategoryRequest): Promise<CategoryResponse> {
    return fetcher<CategoryResponse>(`/api/category/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    })
}
//카테고리 삭제
export async function CategoryDelete(id: number): Promise<void> {
    fetcher<void>(`/api/category/${id}`, {
        method: 'DELETE'
    })
}