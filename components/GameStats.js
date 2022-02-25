import { useEffect } from "react";
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
import { useStaticProps } from "@/lib/hooks";

const Bar = styled("div", {
  background: "$secondary",
  color: "white",
  borderRadius: "$sm !important",
  overflow: "hidden",

  variants: {
    mine: {
      true: {
        background: "$success",
      },
    },
  },
});

const GameStats = () => {
  const { wordLength, gameId } = useSelector((state) => state.settings);
  const stats = useSelector((state) => state.gameStats?.value);
  const { statistics: initialStatistics } = useStaticProps();
  const distribution = [];
  const ownStats = useSelector((state) => state.statistics);
  const ownScore = ownStats?.[wordLength]?.[gameId];

  for (let i = 1; i <= wordLength + 1; i++) {
    distribution.push(
      stats?.distribution?.find((d) => d.tries === i)?.amount || 0
    );
  }

  const maxDistributionValue = Math.max(...distribution);

  return (
    <Card>
      <Collapse.Group>
        <Collapse
          title=""
          subtitle={`${Math.round(
            stats && stats.wins ? stats?.wins : initialStatistics.wins
          )}% van de spelers raadde dit woord.`}>
          <Container gap={1} css={{ color: "$text" }}>
            {distribution?.map((amount, k) => {
              return (
                <Row
                  key={`gameStatsDistribution-${k}`}
                  gap={1}
                  css={{ marginBottom: "$4" }}>
                  <Col span={5} css={{ textAlign: "right" }}>
                    <Text b>{k + 1}</Text> {k === 0 ? "poging" : "pogingen"}
                  </Col>
                  <Col span={7}>
                    <Bar
                      mine={ownScore === k + 1}
                      css={{
                        width: `${(amount / maxDistributionValue) * 100}%`,
                      }}>
                      {amount && (
                        <Text
                          css={{
                            color: "$background",
                            margin: "$2",
                            padding: "$2 $0",
                            fontSize: "11px",
                          }}>
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
