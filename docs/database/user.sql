SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `QQid` bigint(20) NOT NULL COMMENT 'QQ号',
  `score` int(11) NULL DEFAULT NULL COMMENT '积分',
  `sign_Date` date NULL DEFAULT NULL COMMENT '上次签到时间',
  `dayN` int(11) NULL DEFAULT NULL COMMENT '本月签到数',
  `ban` int(11) NULL DEFAULT 0 COMMENT '是否被ban\n1为是，0为否',
  PRIMARY KEY (`QQid`) USING BTREE,
  UNIQUE INDEX `QQid_UNIQUE`(`QQid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = COMPACT;

SET FOREIGN_KEY_CHECKS = 1;
