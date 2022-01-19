import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getStatistics } from "../lib/helpers";
import styled from "styled-components";

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  p {
    text-align: left;
  }
`;

const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Box = styled.div`
  border: 1px solid #ccc;
  min-width: 100px;
  flex: 1;
`;

const Property = styled.div`
  font-weight: bold;
  text-align: center;
  text-tansform: uppercase;
  color: white;
  background-color: var(--headerColor, #000);
  padding: 2px 0px;
`;
const Value = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  font-size: 28px;
  line-height: 9px;

  small {
    font-size: 9px;
  }
`;

const DistributionBox = styled.div`
  min-width: 100%;
  border: 1px solid #ccc;
`;

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

const Statistics = ({ close }) => {
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
    <StatsContainer>
      <div>
        <h1>Statistieken voor {settings.WORD_LENGTH} tekens</h1>
        <Summary>
          <Box style={{ "--headerColor": "#2ecc71" }}>
            <Property>🎉 Gewonnen</Property>
            <Value>
              <span>
                {wins}
                <br />
                <small>{Math.round(pctWins)}%</small>
              </span>
            </Value>
          </Box>
          <Box style={{ "--headerColor": "#c0392b" }}>
            <Property>💀 Verloren</Property>
            <Value>
              <span>
                {lost}
                <br />
                <small>{Math.round(pctLost)}%</small>
              </span>
            </Value>
          </Box>
          <Box style={{ "--headerColor": "#8e44ad" }}>
            <Property>🎳 Langste streak</Property>
            <Value>{biggestStreak}</Value>
          </Box>
          <DistributionBox style={{ "--headerColor": "#f39c12" }}>
            <Property>🔢 Aantal pogingen fancy chart</Property>
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
          </DistributionBox>
        </Summary>
      </div>
      <div>
        <button onClick={() => close()}>🥊 Terug</button>
      </div>
    </StatsContainer>
  );
};

export default Statistics;
