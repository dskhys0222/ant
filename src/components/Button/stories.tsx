import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import Button from "./index";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "danger"],
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
    },
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// デフォルトストーリー
export const Default: Story = {
  args: {
    children: "Button",
  },
};

// バリアント別のストーリー
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger Button",
  },
};

// サイズ別のストーリー
export const Small: Story = {
  args: {
    size: "small",
    children: "Small Button",
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
    children: "Medium Button",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    children: "Large Button",
  },
};

// 状態別のストーリー
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};

export const DisabledPrimary: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: "Disabled Primary",
  },
};

export const DisabledSecondary: Story = {
  args: {
    variant: "secondary",
    disabled: true,
    children: "Disabled Secondary",
  },
};

export const DisabledDanger: Story = {
  args: {
    variant: "danger",
    disabled: true,
    children: "Disabled Danger",
  },
};

// タイプ別のストーリー
export const SubmitButton: Story = {
  args: {
    type: "submit",
    variant: "primary",
    children: "Submit",
  },
};

export const ResetButton: Story = {
  args: {
    type: "reset",
    variant: "secondary",
    children: "Reset",
  },
};

// 複数のバリエーションを一度に表示するストーリー
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};

export const LongText: Story = {
  args: {
    children: "このボタンには非常に長いテキストが含まれています",
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button variant="primary">➕ 追加</Button>
      <Button variant="secondary">✏️ 編集</Button>
      <Button variant="danger">🗑️ 削除</Button>
    </div>
  ),
};
