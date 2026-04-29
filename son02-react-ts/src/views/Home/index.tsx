// 此页面仅用于占位
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FireOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Statistic,
  Tag,
} from "antd";
import styled from "styled-components";

const HomeWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const WelcomeSection = styled.div`
  margin-bottom: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  color: #000;

  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 16px;
  }
`;

const StatCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-body {
    padding: 20px;
  }
`;

const ChartCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const ActivityItem = styled(List.Item)`
  padding: 12px 0 !important;
  border-bottom: 1px solid #f0f0f0 !important;

  &:last-child {
    border-bottom: none !important;
  }
`;

const QuickActionBtn = styled(Button)`
  width: 100%;
  margin-bottom: 12px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  font-size: 15px;
`;

const Home = () => {
  // 模拟统计数据
  const statsData = [
    {
      title: "总用户数",
      value: 12893,
      prefix: <UserOutlined />,
      suffix: "人",
      trend: "up",
      trendValue: 12.5,
      color: "#1890ff",
    },
    {
      title: "活跃用户",
      value: 8234,
      prefix: <TeamOutlined />,
      suffix: "人",
      trend: "up",
      trendValue: 8.3,
      color: "#52c41a",
    },
    {
      title: "今日订单",
      value: 356,
      prefix: <ShoppingCartOutlined />,
      suffix: "单",
      trend: "down",
      trendValue: 3.2,
      color: "#faad14",
    },
    {
      title: "总收入",
      value: 89562,
      prefix: <DollarOutlined />,
      suffix: "元",
      trend: "up",
      trendValue: 15.8,
      color: "#f5222d",
    },
  ];

  // 模拟活动数据
  const activities = [
    {
      user: "张三",
      action: "完成了订单支付",
      time: "2分钟前",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    },
    {
      user: "李四",
      action: "注册了新账号",
      time: "15分钟前",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    },
    {
      user: "王五",
      action: "提交了产品评价",
      time: "1小时前",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    },
    {
      user: "赵六",
      action: "升级了会员等级",
      time: "2小时前",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    },
    {
      user: "孙七",
      action: "创建了新的项目",
      time: "3小时前",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    },
  ];

  // 模拟热门商品
  const hotProducts = [
    { name: "iPhone 15 Pro", sales: 2345, tag: "hot" },
    { name: "MacBook Pro", sales: 1876, tag: "new" },
    { name: "AirPods Pro", sales: 1654, tag: "hot" },
    { name: "iPad Air", sales: 1432, tag: "sale" },
  ];

  return (
    <HomeWrapper>
      {/* 欢迎区域 */}
      <WelcomeSection>
        <h2>👋 欢迎回来，管理员</h2>
        <p>今天是美好的一天，让我们看看今天的数据吧！</p>
      </WelcomeSection>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatCard>
              <Statistic
                title={
                  <span style={{ fontSize: 14, color: "#666" }}>
                    {stat.title}
                  </span>
                }
                value={stat.value}
                prefix={
                  <span style={{ color: stat.color, fontSize: 20 }}>
                    {stat.prefix}
                  </span>
                }
                suffix={stat.suffix}
                valueStyle={{
                  color: stat.color,
                  fontSize: 24,
                  fontWeight: 600,
                }}
              />
              <div style={{ marginTop: 8, fontSize: 13 }}>
                {stat.trend === "up" ? (
                  <span style={{ color: "#52c41a" }}>
                    <ArrowUpOutlined /> {stat.trendValue}%
                  </span>
                ) : (
                  <span style={{ color: "#f5222d" }}>
                    <ArrowDownOutlined /> {stat.trendValue}%
                  </span>
                )}
                <span style={{ marginLeft: 8, color: "#999" }}>较昨日</span>
              </div>
            </StatCard>
          </Col>
        ))}
      </Row>

      {/* 图表和活动区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        {/* 左侧：销售趋势 */}
        <Col xs={24} lg={16}>
          <ChartCard title="销售趋势" extra={<Tag color="blue">本周</Tag>}>
            <div
              style={{
                height: 300,
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                padding: "20px 0",
              }}
            >
              {[65, 45, 78, 52, 90, 68, 85].map((height, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    background: "#1890ff",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                    e.currentTarget.style.transform = "scaleY(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "scaleY(1)";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: -25,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    {
                      ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][
                        index
                      ]
                    }
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* 任务进度 */}
          <ChartCard title="任务进度">
            <div style={{ padding: "10px 0" }}>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span>项目开发</span>
                  <span style={{ color: "#1890ff", fontWeight: 500 }}>75%</span>
                </div>
                <Progress percent={75} strokeColor="#1890ff" showInfo={false} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span>UI设计</span>
                  <span style={{ color: "#52c41a", fontWeight: 500 }}>90%</span>
                </div>
                <Progress percent={90} strokeColor="#52c41a" showInfo={false} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span>测试优化</span>
                  <span style={{ color: "#faad14", fontWeight: 500 }}>45%</span>
                </div>
                <Progress percent={45} strokeColor="#faad14" showInfo={false} />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span>文档编写</span>
                  <span style={{ color: "#f5222d", fontWeight: 500 }}>30%</span>
                </div>
                <Progress percent={30} strokeColor="#f5222d" showInfo={false} />
              </div>
            </div>
          </ChartCard>
        </Col>

        {/* 右侧：活动和快捷操作 */}
        <Col xs={24} lg={8}>
          {/* 最新动态 */}
          <ChartCard
            title="最新动态"
            extra={<FireOutlined style={{ color: "#ff4d4f" }} />}
          >
            <List
              dataSource={activities}
              renderItem={(item) => (
                <ActivityItem>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} size="large" />}
                    title={<span style={{ fontWeight: 500 }}>{item.user}</span>}
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>{item.action}</div>
                        <div style={{ fontSize: 12, color: "#999" }}>
                          <ClockCircleOutlined /> {item.time}
                        </div>
                      </div>
                    }
                  />
                </ActivityItem>
              )}
            />
          </ChartCard>

          {/* 热门商品 */}
          <ChartCard title="热门商品">
            <List
              dataSource={hotProducts}
              renderItem={(item, index) => (
                <List.Item>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background:
                          index < 3
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "#f0f0f0",
                        color: index < 3 ? "white" : "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        销量: {item.sales}
                      </div>
                    </div>
                    <Tag
                      color={
                        item.tag === "hot"
                          ? "red"
                          : item.tag === "new"
                            ? "green"
                            : "orange"
                      }
                    >
                      {item.tag === "hot"
                        ? "热销"
                        : item.tag === "new"
                          ? "新品"
                          : "促销"}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </ChartCard>

          {/* 快捷操作 */}
          <ChartCard title="快捷操作">
            <QuickActionBtn type="primary" icon={<UserOutlined />}>
              添加用户
            </QuickActionBtn>
            <QuickActionBtn icon={<ShoppingCartOutlined />}>
              创建订单
            </QuickActionBtn>
            <QuickActionBtn icon={<DollarOutlined />}>财务报表</QuickActionBtn>
            <QuickActionBtn icon={<TeamOutlined />}>团队管理</QuickActionBtn>
          </ChartCard>
        </Col>
      </Row>
    </HomeWrapper>
  );
};

export default Home;
