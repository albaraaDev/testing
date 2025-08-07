import { TripPath } from '@/api/trips';

export function interpolateKeyframes(keyframes: TripPath[], time: number) {
  // Binary search to find the index of the keyframe just before the given time
  let low = 0;
  let high = keyframes.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (keyframes[mid].timestamp.getTime() === time) {
      low = mid;
      break;
    } else if (keyframes[mid].timestamp.getTime() < time) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const i = Math.max(0, low - 1);
  const kfStart = keyframes[i];
  const kfEnd = keyframes[i + 1];

  if (
    kfStart &&
    kfEnd &&
    time >= kfStart.timestamp.getTime() &&
    time <= kfEnd.timestamp.getTime()
  ) {
    const denominator = kfEnd.timestamp.getTime() - kfStart.timestamp.getTime();
    const t = denominator === 0 ? 0 : (time - kfStart.timestamp.getTime()) / denominator; // Normalized time

    return {
      latitute: kfStart.latitude + t * (kfEnd.latitude - kfStart.latitude),
      longitude: kfStart.longitude + t * (kfEnd.longitude - kfStart.longitude),
      direction: kfStart.direction + t * (kfEnd.direction - kfStart.direction),
      speed: kfStart.speed + t * (kfEnd.speed - kfStart.speed)
    };
  }

  return null; // Out of range
}
