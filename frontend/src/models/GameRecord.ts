export interface GameRecord{
    rank: number;
    totalSimilarity: number;
    handSimilarity: number;
    bodySimilarity: number;
    mouseSimilarity: number;
    recordImage: string; // 이미지 파일의 Base64
}