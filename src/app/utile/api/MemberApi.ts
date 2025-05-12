import { MebmerRequest, MemberResponse } from "@/app/utile/interfaces/member/MemberModel";
import { fetcher } from "./fetcher";

//회원 가입 
export async function MemberJoin(data: MebmerRequest):Promise<MemberResponse> {
    return fetcher<MemberResponse>("/api/member/",{
        method: "POST",
        body: JSON.stringify(data),
    });
}

//회원 조회
export async function MemberDetail(id:number):Promise<MemberResponse>{
    return fetcher<MemberResponse>(`/api/member/${id}`,{
        method:"GET"
    });
}

//회원 수정
export async function MemberUpdate(id:number,data:MebmerRequest):Promise<MemberResponse>{
    return fetcher<MemberResponse>(`/api/member/${id}`,{
        method:"PUT",
        body:JSON.stringify(data),
    });
}

//회원 탈퇴
export async function MemberDelete(id:number):Promise<void>{
    return await fetcher<void>(`/api/member/${id}`,{
        method:'DELETE'
    })
}
