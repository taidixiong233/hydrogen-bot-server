SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for game_a_sky
-- ----------------------------
DROP TABLE IF EXISTS `game_a_sky`;
CREATE TABLE `game_a_sky`  (
  `QQid` bigint(20) NOT NULL,
  `type` int(10) NOT NULL COMMENT '飞机类型',
  `timestamp` bigint(255) NOT NULL COMMENT '起飞时的时间戳',
  PRIMARY KEY (`QQid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = COMPACT;

SET FOREIGN_KEY_CHECKS = 1;
