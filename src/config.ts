export const WIDTH = 400;
export const HEIGHT = 600;

export const BIRD_GRAVITY = 2000;
export const BIRD_JUMP_STRENGTH = -600;

export const WALL_MARGIN = 40;

export const SPIKE_DELAY_TIME = 0.3;

export const MAX_DT = 0.05;

export interface LevelConfig {
  name: string;
  speed: number;
  spikeFrequency: number;
}

export const LEVELS: Record<number, LevelConfig> = {
  1: { name: "Easy", speed: 150, spikeFrequency: 2 },
  2: { name: "Medium", speed: 200, spikeFrequency: 3 },
  3: { name: "Hard", speed: 250, spikeFrequency: 4 },
  4: { name: "Expert", speed: 300, spikeFrequency: 5 },
};

export const FONT = '"Lilita One", Arial, sans-serif';
