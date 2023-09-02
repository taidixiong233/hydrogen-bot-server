const parameter: Map<string, Parameter_> = new Map();

interface Parameter extends Aircraft, Artillery {}

type Parameter_ = PartialPropsOption<
  PartialPropsOption<PartialPropsOption<Parameter, "暴击攻击">, "攻击系数">,
  "防御系数"
>;

type PartialPropsOption<T, K extends keyof T> = Partial<Pick<T, K>> &
  Omit<T, K>;

parameter
  .set("纸飞机", {
    type: 101,
    score: 100,
    防御系数: 1.81,
    级别: 1,
  })
  .set("木飞机", {
    type: 102,
    score: 200,
    防御系数: 1.98,
    级别: 2,
  })
  .set("铁皮飞机", {
    type: 103,
    score: 500,
    防御系数: 2.24,
    级别: 3,
  })
  .set("钢化飞机", {
    type: 104,
    score: 1000,
    防御系数: 2.45,
    级别: 4,
  })
  .set("窜天猴发射器", {
    type: 201,
    score: 100,
    攻击系数: 1.99,
    级别: 1,
    暴击攻击: 2.25,
  })
  .set("对天导弹发射器", {
    type: 202,
    score: 200,
    攻击系数: 2.21,
    级别: 2,
    暴击攻击: 2.51,
  })
  .set("多角度发射器", {
    type: 203,
    score: 300,
    攻击系数: 2.35,
    级别: 3,
    暴击攻击: 2.68,
  })
  .set("高精度发射器", {
    type: 204,
    score: 500,
    攻击系数: 2.54,
    级别: 4,
    暴击攻击: 2.9,
  });

export interface Aircraft {
  type: number;
  score: number;
  防御系数: number;
  级别: 1 | 2 | 3 | 4;
}

export interface Artillery {
  type: number;
  score: number;
  攻击系数: number;
  级别: 1 | 2 | 3 | 4;
  暴击攻击: number;
}

export default parameter;
