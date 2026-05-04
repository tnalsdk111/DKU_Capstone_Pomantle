import { Results } from '@mediapipe/holistic';

export interface Data{
    id: number;
    originalImage: string;
    publicImage: string;
    poseName: string;
    vector: Results | null;
    createdAt: string;
    usedAt: string;
}