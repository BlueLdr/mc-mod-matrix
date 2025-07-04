"use client";

import { styled, alpha } from "@mui/material/styles";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

import type { TypographyProps } from "@mui/material/Typography";
import type { CardProps } from "@mui/material/Card";

//================================================

const EmptyViewStyledCard = styled(Card)`
  background-color: ${({ theme }) => alpha(theme.palette.background.layer, 0.01)};
  border-color: ${({ theme }) => alpha(theme.palette.divider, 0.08)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function EmptyViewCard({
  typographyProps = {},
  children,
  ...props
}: CardProps & { typographyProps?: TypographyProps }) {
  return (
    <EmptyViewStyledCard {...props}>
      <Grid container alignItems="center" justifyContent="center" height="100%">
        <Typography variant="body2" color="textDisabled" {...typographyProps}>
          {children}
        </Typography>
      </Grid>
    </EmptyViewStyledCard>
  );
}
