//회원 요청
export interface MebmerRequest {
    userId:string;
    password:string;
    userEmail:string;
    userPhone:string;
    userName:string;
}

//회원수정 요청
export interface MemberUpdateRequest {
    userId:string;
    userEmail:string;
    userPhone:string;
    userName:string;
}

//회원 응답
export interface MemberResponse {
    userId:string;
    password:string;
    userEmail:string;
    userPhone:string;
    userName:string;
    role:string;
    createdBy:string;
    updatedBy:string;
    createdTime:Date;
    updatedTime:Date;
}