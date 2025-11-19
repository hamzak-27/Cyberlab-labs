import { Badge } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Badge Seeder - Creates initial badges for the system
 */

const initialBadges = [
  // Labs Completed Badges
  {
    name: 'First Steps',
    description: 'Complete your first lab',
    icon: '🎯',
    criteria: {
      type: 'labs_completed',
      value: 1
    },
    rarity: 'common',
    points: 10
  },
  {
    name: 'Getting Started',
    description: 'Complete 5 labs',
    icon: '🏃',
    criteria: {
      type: 'labs_completed',
      value: 5
    },
    rarity: 'common',
    points: 25
  },
  {
    name: 'Lab Enthusiast',
    description: 'Complete 25 labs',
    icon: '⚡',
    criteria: {
      type: 'labs_completed',
      value: 25
    },
    rarity: 'rare',
    points: 100
  },
  {
    name: 'Lab Master',
    description: 'Complete 100 labs',
    icon: '🔥',
    criteria: {
      type: 'labs_completed',
      value: 100
    },
    rarity: 'epic',
    points: 500
  },

  // Points Earned Badges
  {
    name: 'Point Collector',
    description: 'Earn your first 100 points',
    icon: '💎',
    criteria: {
      type: 'points_earned',
      value: 100
    },
    rarity: 'common',
    points: 20
  },
  {
    name: 'Point Hunter',
    description: 'Earn 1,000 points',
    icon: '💰',
    criteria: {
      type: 'points_earned',
      value: 1000
    },
    rarity: 'rare',
    points: 150
  },
  {
    name: 'Point Legend',
    description: 'Earn 10,000 points',
    icon: '👑',
    criteria: {
      type: 'points_earned',
      value: 10000
    },
    rarity: 'legendary',
    points: 1000
  },

  // Category Master Badges
  {
    name: 'Web Expert',
    description: 'Complete all Web category labs',
    icon: '🌐',
    criteria: {
      type: 'category_master',
      value: 1,
      category: 'Web'
    },
    rarity: 'rare',
    points: 200,
    color: '#FF6B35'
  },
  {
    name: 'Binary Ninja',
    description: 'Complete all Binary category labs',
    icon: '⚙️',
    criteria: {
      type: 'category_master',
      value: 1,
      category: 'Binary'
    },
    rarity: 'rare',
    points: 200,
    color: '#2E86AB'
  },
  {
    name: 'Network Guardian',
    description: 'Complete all Network category labs',
    icon: '🛡️',
    criteria: {
      type: 'category_master',
      value: 1,
      category: 'Network'
    },
    rarity: 'rare',
    points: 200,
    color: '#A23B72'
  },
  {
    name: 'Crypto Wizard',
    description: 'Complete all Cryptography category labs',
    icon: '🔐',
    criteria: {
      type: 'category_master',
      value: 1,
      category: 'Crypto'
    },
    rarity: 'rare',
    points: 200,
    color: '#F18F01'
  },
  {
    name: 'Forensics Detective',
    description: 'Complete all Forensics category labs',
    icon: '🔍',
    criteria: {
      type: 'category_master',
      value: 1,
      category: 'Forensics'
    },
    rarity: 'rare',
    points: 200,
    color: '#C73E1D'
  },

  // Streak Badges
  {
    name: 'On Fire',
    description: 'Get a 5 lab completion streak',
    icon: '🔥',
    criteria: {
      type: 'streak',
      value: 5
    },
    rarity: 'rare',
    points: 100
  },
  {
    name: 'Unstoppable',
    description: 'Get a 10 lab completion streak',
    icon: '🚀',
    criteria: {
      type: 'streak',
      value: 10
    },
    rarity: 'epic',
    points: 250
  },
  {
    name: 'Legendary Streak',
    description: 'Get a 25 lab completion streak',
    icon: '⭐',
    criteria: {
      type: 'streak',
      value: 25
    },
    rarity: 'legendary',
    points: 750
  },

  // Perfectionist Badges
  {
    name: 'Perfectionist',
    description: 'Complete 5 labs without any wrong flag submissions',
    icon: '✨',
    criteria: {
      type: 'perfectionist',
      value: 5
    },
    rarity: 'rare',
    points: 150
  },
  {
    name: 'Flawless Execution',
    description: 'Complete 25 labs without any wrong flag submissions',
    icon: '💯',
    criteria: {
      type: 'perfectionist',
      value: 25
    },
    rarity: 'epic',
    points: 500
  },

  // Speed Demon Badges
  {
    name: 'Speed Runner',
    description: 'Complete any lab in under 15 minutes',
    icon: '⚡',
    criteria: {
      type: 'speed_demon',
      value: 1,
      timeLimit: 15
    },
    rarity: 'rare',
    points: 100
  },
  {
    name: 'Lightning Fast',
    description: 'Complete any lab in under 5 minutes',
    icon: '⛈️',
    criteria: {
      type: 'speed_demon',
      value: 1,
      timeLimit: 5
    },
    rarity: 'epic',
    points: 300
  },

  // Explorer Badge
  {
    name: 'Explorer',
    description: 'Complete at least one lab in every category',
    icon: '🗺️',
    criteria: {
      type: 'explorer',
      value: 1
    },
    rarity: 'epic',
    points: 400,
    color: '#8E44AD'
  },

  // Special Badges
  {
    name: 'Early Adopter',
    description: 'One of the first 100 users to complete a lab',
    icon: '🌟',
    criteria: {
      type: 'labs_completed',
      value: 1
    },
    rarity: 'legendary',
    points: 500,
    isHidden: true
  },
  {
    name: 'Night Owl',
    description: 'Complete 10 labs between midnight and 6 AM',
    icon: '🦉',
    criteria: {
      type: 'dedication',
      value: 10
    },
    rarity: 'rare',
    points: 150,
    isHidden: true
  }
];

/**
 * Seed badges into the database
 */
export async function seedBadges(force = false) {
  try {
    logger.info('Starting badge seeding...');
    
    // Check if badges already exist
    const existingBadges = await Badge.countDocuments();
    
    if (existingBadges > 0 && !force) {
      logger.info(`Badges already exist (${existingBadges} found). Skipping seed.`);
      return {
        success: true,
        message: 'Badges already exist',
        count: existingBadges
      };
    }
    
    // Clear existing badges if force is true
    if (force) {
      await Badge.deleteMany({});
      logger.info('Cleared existing badges for reseeding');
    }
    
    // Insert new badges
    const insertedBadges = await Badge.insertMany(initialBadges);
    
    logger.info(`Successfully seeded ${insertedBadges.length} badges`);
    
    // Log badge summary by rarity
    const badgesByRarity = insertedBadges.reduce((acc, badge) => {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
      return acc;
    }, {});
    
    logger.info('Badge summary:', {
      total: insertedBadges.length,
      byRarity: badgesByRarity,
      totalPoints: insertedBadges.reduce((sum, badge) => sum + badge.points, 0)
    });
    
    return {
      success: true,
      message: 'Badges seeded successfully',
      count: insertedBadges.length,
      summary: badgesByRarity
    };
    
  } catch (error) {
    logger.error('Badge seeding failed:', error);
    throw new Error(`Badge seeding failed: ${error.message}`);
  }
}

/**
 * Get badge seeding status
 */
export async function getBadgeSeedStatus() {
  try {
    const totalBadges = await Badge.countDocuments();
    const activeBadges = await Badge.countDocuments({ isActive: true });
    const hiddenBadges = await Badge.countDocuments({ isHidden: true });
    
    const badgesByRarity = await Badge.aggregate([
      { $group: { _id: '$rarity', count: { $sum: 1 } } }
    ]);
    
    return {
      total: totalBadges,
      active: activeBadges,
      hidden: hiddenBadges,
      byRarity: badgesByRarity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      isSeeded: totalBadges > 0
    };
  } catch (error) {
    logger.error('Error getting badge seed status:', error);
    throw error;
  }
}

export default {
  seedBadges,
  getBadgeSeedStatus,
  initialBadges
};