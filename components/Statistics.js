import { Modal, Grid, Text, Card } from "@nextui-org/react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { hide } from "../redux/features/modal";
import { getStatistics } from "../lib/helpers";

const DistributionValue = styled.div`
  box-sizing: border-box;
  padding: 5px;
`;

const DistributionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 5fr;
  grid-auto-rows: 20px;
  grid-gap: 5px;
  align-items: center;
`;

const DistributionLabel = styled.div`
  text-align: center;
`;

const DistributionBarWrapper = styled.div``;

const DistributionBar = styled.div`
  background: #d35400;
  color: white;
  padding: 1px;
`;

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
  const distributionValues = Array.from({ length: settings.BOARD_SIZE }).map(
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
            <Text b>{settings.WORD_LENGTH} tekens</Text>
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
            <DistributionValue>
              {distributionValues.map((item) => {
                return (
                  <DistributionRow key={`distribution-${item.amount}`}>
                    <DistributionLabel>{item.amount}</DistributionLabel>
                    <DistributionBarWrapper>
                      <DistributionBar
                        style={{
                          width: `${item.pct}%`,
                          display: item.pct ? "block" : "none",
                        }}>
                        {item.value ? `${item.value}x` : ""}
                      </DistributionBar>
                    </DistributionBarWrapper>
                  </DistributionRow>
                );
              })}
            </DistributionValue>
          </Box>
        </Grid.Container>
      </Modal.Body>
    </Modal>
  );
};

export default Statistics;
