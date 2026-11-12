import {loadFont as loadSans} from '@remotion/google-fonts/NotoSans';
import {loadFont as loadSerif} from '@remotion/google-fonts/NotoSerif';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const opts = {subsets: ['latin' as const]};

export const sans = loadSans('normal', {weights: ['400', '500', '600', '700'], ...opts}).fontFamily;
export const serif = loadSerif('normal', {weights: ['600', '700'], ...opts}).fontFamily;
export const mono = loadMono('normal', {weights: ['500'], ...opts}).fontFamily;
