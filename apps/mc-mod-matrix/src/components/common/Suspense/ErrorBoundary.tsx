"use client";

import { Component } from "react";

import { ErrorView } from "./ErrorView";

import type { DistributiveOmit } from "@mcmm/types";
import type { ErrorViewProps } from "./ErrorView";

//================================================

export type ErrorBoundaryProps = {
  children: React.ReactNode;
  resetKeys?: any[];
} & DistributiveOmit<ErrorViewProps, "error">;

export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: any }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>) {
    if (
      !this.state.error ||
      (!this.props.resetKeys && !prevProps.resetKeys) ||
      this.props.resetKeys === prevProps.resetKeys
    ) {
      return;
    }
    if (
      !Array.isArray(this.props.resetKeys) ||
      !Array.isArray(prevProps.resetKeys) ||
      !ErrorBoundary.areResetKeysEqual(this.props.resetKeys, prevProps.resetKeys)
    ) {
      this.setState({ error: null });
    }
  }

  static areResetKeysEqual = (a: any[], b: any[]) =>
    a.length === b.length && a.every((item, index) => Object.is(item, b[index]));

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    const { children, ...props } = this.props;
    if (this.state.error) {
      return <ErrorView {...props} error={this.state.error} />;
    }
    return children;
  }
}
