import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSkeleton.css';

/**
 * Loading skeleton component for parking cards
 * Provides visual feedback while data is loading
 */
const ParkingCardSkeleton = () => {
  return (
    <div className="parking-card skeleton">
      <div className="skeleton-name skeleton-shimmer"></div>
      <div className="skeleton-spots skeleton-shimmer"></div>
      <div className="skeleton-age skeleton-shimmer"></div>
      <div className="skeleton-timestamp skeleton-shimmer"></div>
    </div>
  );
};

/**
 * Grid of loading skeletons
 * @param {number} count - Number of skeleton cards to display
 */
export const ParkingGridSkeleton = ({ count = 2 }) => {
  return (
    <div className="grid-container">
      {Array.from({ length: count }).map((_, i) => (
        <ParkingCardSkeleton key={i} />
      ))}
    </div>
  );
};

ParkingGridSkeleton.propTypes = {
  count: PropTypes.number
};

/**
 * Loading spinner
 */
export const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
};

export default ParkingCardSkeleton;
