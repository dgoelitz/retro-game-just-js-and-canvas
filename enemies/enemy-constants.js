export const ENEMY_MODES = {
  patrol: {
    PATROL: "patrol",
    CHASE: "chase",
    RETURN: "return"
  },
  miniboss: {
    THROW: "throw",
    SPIN: "spin",
    REST: "rest"
  },
  boss: {
    SLAM: "slam",
    IMPACT: "impact",
    STUNNED: "stunned"
  }
};

export const ENEMY_RENDERING = {
  colorsByType: {
    patrol: "#e43636",
    turret: "#94b0c2",
    "fixed-turret": "#c2c3c7",
    stone: "#7e7f82",
    snake: "#00a84f",
    miniboss: "#ff77a8",
    boss: "#ff004d"
  },
  stunnedFlashColor: "#fff1e8",
  transparentAlpha: 0.45
};

export const ENEMY_COMBAT = {
  bulletSpawnOffset: 2,
  turretProjectileSpeed: 74,
  fixedTurretProjectileSpeed: 78
};
