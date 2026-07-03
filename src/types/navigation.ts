import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Level } from '../utils/progress';

export type GameParams = {
  level: Level;
};

export type ResultParams = {
  score: number;
  correctCount: number;
  total: number;
  level: Level;
};

export type RootStackParamList = {
  Home: undefined;
  LevelSelect: undefined;
  Game: GameParams;
  Result: ResultParams;
  Stats: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type LevelSelectScreenProps = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;
export type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;
export type StatsScreenProps = NativeStackScreenProps<RootStackParamList, 'Stats'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
