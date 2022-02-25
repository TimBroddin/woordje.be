import {
  Modal,
  Grid,
  Text,
  Card,
  Container,
  Row,
  Col,
  styled,
} from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";

import { hide } from "@/redux/features/modal";
import { getStatistics } from "@/lib/helpers";

const Bar = styled("div", {
  background: "$secondary",
  color: "white",
  borderRadius: "$sm !important",
  overflow: "hidden",
});

const Box = ({ title, num, pct, color, large, children }) => {
  return (
    <Grid xs={large ? 12 : 6}>
      <Card color={color}>
        <Card.Header>
          <Text b css={{ fontWeight: "$bold", color: "$white" }}>
            {title}
          </Text>
        </Card.Header>
        <Card.Body>
          {children ? (
            children
          ) : (
            <Text size="24px" css={{ fontWeight: "$bold", color: "$white" }}>
              {num} {pct ? <Text small>({Math.round(pct)}%)</Text> : null}
            </Text>
          )}
        </Card.Body>
      </Card>
    </Grid>
  );
};

const Statistics = ({ visible }) => {
  const dispatch = useDispatch();

  const closeHandler = (e) => {
    dispatch(hide());
  };

  const { wins, lost, distribution, biggestStreak } =
    useSelector(getStatistics);
  const settings = useSelector((state) => state.settings);
  const totalGames = wins + lost;
  const pctWins = totalGames ? (wins / totalGames) * 100 : 0;
  const pctLost = totalGames ? (lost / totalGames) * 100 : 0;

  const maxDistributionValue = Math.max(...Object.values(distribution));
  const distributionValues = Array.from({ length: settings.boardSize }).map(
    (_, idx) => {
      return {
        amount: idx + 1,
        value: distribution[idx + 1] || 0,
        pct: distribution[idx + 1]
          ? (distribution[idx + 1] / maxDistributionValue) * 100
          : 0,
      };
    }
  );

  distributionValues.unshift({
    amount: "💀",
    value: distribution[-1] || 0,
    pct: distribution[-1] ? (distribution[-1] / maxDistributionValue) * 100 : 0,
  });
  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={visible}
      onClose={closeHandler}>
      <Modal.Header>
        <Text>
          Statistieken voor{" "}
          {settings.gameType === "vrttaal" ? (
            <Text b>het VRT Taal woord</Text>
          ) : (
            <Text b>{settings.wordLength} tekens</Text>
          )}
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Grid.Container gap={2}>
          <Box title="🎉 Gewonnen" num={wins} pct={pctWins} color="success" />
          <Box title="💀 Verloren" num={lost} pct={pctLost} color="warning" />
          <Box
            large
            title="🎳 Langste streak"
            num={biggestStreak}
            color="gradient"
          />
          <Box title="Aantal pogingen" large color="primary">
            <Container gap={0} css={{ color: "$white" }}>
              {distributionValues.map((item) => {
                return (
                  <Row
                    key={`distribution-${item.amount}`}
                    gap={1}
                    css={{ marginBottom: "$4" }}>
                    <Col span={2} css={{ textAlign: "right" }}>
                      <Text b css={{ color: "white" }}>
                        {item.amount}
                      </Text>
                    </Col>
                    <Col span={10}>
                      <Bar
                        css={{
                          width: `${item.pct}%`,
                        }}>
                        {item.value && (
                          <Text css={{ color: "$white", margin: "$2" }}>
                            {item.value}x
                          </Text>
                        )}
                      </Bar>
                    </Col>
                  </Row>
                );
              })}
            </Container>
          </Box>
        </Grid.Container>
      </Modal.Body>
    </Modal>
  );
};

export default Statistics;
