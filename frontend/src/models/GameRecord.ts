export interface GameRecord{
    rank: number;
    totalSimilarity: number;
    righthandSimilarity: number;
    lefthandSimilarity: number;
    bodySimilarity: number;
    mouseSimilarity: number;
    recordImage: string; // 이미지 파일의 Base64
}