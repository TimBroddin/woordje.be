import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Image from "next/image";
import { motion } from "framer-motion";
import { hide } from "../redux/features/installPopup";

const isIphone = () => {
  if (typeof window !== "undefined") {
    const userAgent = window.navigator.userAgent.toLowerCase();

    return /iphone/.test(userAgent);
  } else {
    return false;
  }
};

const Root = styled.div``;
const Popup = styled(motion.div)`
  position: fixed;
  z-index: 9999;
  max-width: 380px;
  margin: auto;
  bottom: 20px;
  left: 0;
  right: 0;
`;
const Wrapper = styled.div`
  display: flex;
  background-color: #ffffff;
  align-items: center;
  justify-content: space-around;
  flex-direction: row;
  border-radius: 5px;
  padding: 10px;
  margin: 0 20px;
  box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.2);

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    border-top: solid 10px #ffffff;
    border-left: solid 10px transparent;
    border-right: solid 10px transparent;
  }
`;
const LabelWrapper = styled.div`
  text-align: center;
  color: #202020;
`;
const Label = styled.div`
  font-size: 14px;
`;

const CloseWrapper = styled.div``;
const ShareIcon = styled.span`
  margin: 10px 10px 0 10px;
`;
const CloseIcon = styled(Image)``;

const AddToHomeScreen = () => {
  const visible = useSelector((state) => state.installPopup.visible);
  const statistics = useSelector((state) => state.statistics);
  const dispatch = useDispatch();
  const [canShow, setCanShow] = useState(true);
  useEffect(() => {
    setCanShow(statistics.length);
  }, []);

  return isIphone() && canShow && visible ? (
    <Root>
      <Popup initial={{ y: 10 }} animate={{ y: 0 }}>
        <Wrapper>
          <LabelWrapper>
            <Label>Zet Woordje op je beginscherm</Label>
            <Label>
              Tap
              <ShareIcon>
                <Image
                  src={"/icons/iosshare.svg"}
                  alt="Share"
                  width={20}
                  height={20}
                />
              </ShareIcon>
              en kies dan &ldquo;Zet op beginscherm&rdquo;
            </Label>
          </LabelWrapper>
          <CloseWrapper onClick={(e) => dispatch(hide())}>
            <CloseIcon
              src={"/icons/close.svg"}
              alt="Sluiten"
              width={20}
              height={20}
            />
          </CloseWrapper>
        </Wrapper>
      </Popup>
    </Root>
  ) : null;
};

export default AddToHomeScreen;
