// Delegate utility implementations to the shared module so approximation
// logic (including `APPROXIMATION_THRESHOLD_MINUTES`) is consistent across apps.
import {
  applyApproximations as sharedApplyApproximations,
  calculateDataAge as sharedCalculateDataAge,
  formatAgeLabel as sharedFormatAgeLabel
} from '../../shared/src/parkingUtils.js';

export const calculateDataAge = (timestamp, now) => sharedCalculateDataAge(timestamp, now);
export const applyApproximations = (realtimeData, now) => sharedApplyApproximations(realtimeData, now);
export const formatAgeLabel = (age) => sharedFormatAgeLabel(age);
