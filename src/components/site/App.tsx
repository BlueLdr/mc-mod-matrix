import styled from "@emotion/styled";

import { AppRouter } from "./AppRouter";
// import { Footer } from "./Footer";
// import { Header } from "./Header";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";

//================================================

const SiteContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
`;
SiteContainer.displayName = "styled(SiteContainer)";

const Body = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  box-sizing: border-box;
  & > .pending-view,
  & > * > .pending-view {
    min-height: ${({ theme }) => theme.spacing(120)};
  }
`;
Body.displayName = "Body";

function App() {
  return (
    <>
      <CssBaseline />
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <SiteContainer flexGrow={1}>
          {/* <Header /> */}
          <Body>
            <AppRouter />
          </Body>
          {/* <Footer /> */}
        </SiteContainer>
      </Box>
    </>
  );
}

export default App;
