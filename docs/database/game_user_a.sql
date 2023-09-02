SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for game_user_a
-- ----------------------------
DROP TABLE IF EXISTS `game_user_a`;
CREATE TABLE `game_user_a`  (
  `QQid` bigint(20) UNSIGNED NOT NULL COMMENT 'QQ号',
  `type` int(10) NULL DEFAULT NULL COMMENT '飞机、高射炮编号',
  `allow` int(10) UNSIGNED NOT NULL DEFAULT 2 COMMENT '飞行许可证状态0-正常，1-吊销，2-未办理，3-炮兵',
  `bulletN` bigint(20) UNSIGNED NOT NULL COMMENT '炮弹数',
  `timeout` bigint(255) NULL DEFAULT NULL,
  PRIMARY KEY (`QQid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = COMPACT;

SET FOREIGN_KEY_CHECKS = 1;
