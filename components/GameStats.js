import {
  Card,
  Collapse,
  Text,
  styled,
  Container,
  Col,
  Row,
} from "@nextui-org/react";
import { useSelector } from "react-redux";
import { useStats } from "@/lib/hooks";

const Bar = styled("div", {
  background: "$secondary",
  color: "white",
  borderRadius: "$sm !important",
  overflow: "hidden",
});

const GameStats = ({}) => {
  const { wordLength, gameType, gameId } = useSelector(
    (state) => state.settings
  );
  const { stats } = useStats(gameId, wordLength, gameType);
  console.log(stats);
  const distribution = [];
  for (let i = 1; i <= wordLength + 1; i++) {
    distribution.push(
      stats?.distribution.find((d) => d.tries === i)?.amount || 0
    );
  }

  console.log(distribution);

  return (
    <Card>
      <Collapse.Group>
        <Collapse
          title=""
          subtitle={`${stats?.wins}% van de spelers raadt dit woord.`}>
          <Container gap={1} css={{ color: "$text" }}>
            {distribution?.map((amount, k) => {
              return (
                <Row
                  key={`gameStatsDistribution-${k}`}
                  gap={1}
                  css={{ marginBottom: "$4" }}>
                  <Col span={4} css={{ textAlign: "right" }}>
                    <Text b>{k + 1}</Text> {k === 0 ? "poging" : "pogingen"}
                  </Col>
                  <Col span={8}>
                    <Bar
                      css={{
                        width: `${amount}%`,
                      }}>
                      {amount && (
                        <Text css={{ color: "$background", margin: "$2" }}>
                          {amount}%
                        </Text>
                      )}
                    </Bar>
                  </Col>
                </Row>
              );
            })}
          </Container>
        </Collapse>
      </Collapse.Group>
    </Card>
  );
};

export default GameStats;
