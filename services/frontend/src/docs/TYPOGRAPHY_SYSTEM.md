# Typography System Documentation

The MTCM Frontend application now includes a comprehensive typography system that provides consistent text styling across the entire application.

## Overview

The typography system is built using styled-components and integrates seamlessly with the existing theme system. It provides standardized font sizes, weights, line heights, and spacing that automatically adapt to both light and dark themes.

## Typography Values

### Font Sizes
- `xs`: 0.75rem (12px) - Small labels, captions
- `sm`: 0.85rem (13.6px) - Secondary text, form labels
- `base`: 0.9rem (14.4px) - Default body text
- `md`: 1rem (16px) - Standard text
- `lg`: 1.125rem (18px) - Larger body text, lead paragraphs
- `xl`: 1.25rem (20px) - Small headings
- `2xl`: 1.5rem (24px) - Medium headings
- `3xl`: 1.875rem (30px) - Large headings
- `4xl`: 2.25rem (36px) - Extra large headings

### Font Weights
- `normal`: 400 - Regular text
- `medium`: 500 - Slightly emphasized text
- `semibold`: 600 - Important text, labels
- `bold`: 700 - Strong emphasis

### Line Heights
- `tight`: 1.2 - Headings, compact text
- `normal`: 1.4 - Default line spacing
- `relaxed`: 1.6 - Comfortable reading

### Letter Spacing
- `tight`: -0.025em - Dense text
- `normal`: 0em - Default spacing
- `wide`: 0.025em - Spaced out text

## Components

### Text Component
The base text component that all other typography components extend:

```tsx
import { Text as ThemedText } from '../components/styled/TypographyStyled';

<ThemedText size="base" weight="normal" color="text">
  Default body text
</ThemedText>

<ThemedText size="sm" color="textMuted">
  Muted secondary text
</ThemedText>

<ThemedText size="lg" weight="semibold" color="primary">
  Primary colored text
</ThemedText>
```

**Props:**
- `size`: Font size from typography scale
- `weight`: Font weight
- `color`: Theme color (`text`, `textMuted`, `primary`, `secondary`, `success`, `warning`)
- `lineHeight`: Line height setting
- `letterSpacing`: Letter spacing setting
- `as`: HTML element type (default: `span`)

### Heading Components

```tsx
import { H1, H2, H3, H4, H5, H6, Heading } from '../components/styled/TypographyStyled';

<H1>Main Page Title</H1>
<H2>Section Title</H2>  
<H3>Subsection Title</H3>
<H4>Component Title</H4>
<H5>Small Section Title</H5>
<H6>Smallest Heading</H6>

// Custom heading with specific size
<Heading level={3} size="xl" weight="bold" color="primary">
  Custom Heading
</Heading>
```

**Default Heading Sizes:**
- H1: 4xl (36px)
- H2: 3xl (30px)  
- H3: 2xl (24px)
- H4: xl (20px)
- H5: lg (18px)
- H6: md (16px)

### Paragraph Component

```tsx
import { Paragraph } from '../components/styled/TypographyStyled';

<Paragraph>
  Standard paragraph text with comfortable line spacing.
</Paragraph>

<Paragraph size="sm" color="textMuted">
  Smaller muted paragraph text.
</Paragraph>
```

### Specialized Components

```tsx
import { Small, Label, Caption, Lead, Code } from '../components/styled/TypographyStyled';

<Small>Small secondary text</Small>
<Label>Form Label</Label>
<Caption>Image caption or fine print</Caption>
<Lead>Lead paragraph for introductory text</Lead>
<Code>inline code</Code>
```

## Usage Guidelines

### 1. Import Typography Components

```tsx
// Import what you need
import { H3, Paragraph, Small, ThemedText as Text } from '../components/styled/TypographyStyled';

// Note: Import Text as ThemedText to avoid conflicts with DOM Text interface
```

### 2. Replace Hardcoded Typography

**❌ Before:**
```tsx
<h3 style={{ color: theme.text, fontSize: '1.5rem', fontWeight: '600' }}>
  Section Title
</h3>
<p style={{ color: '#6c757d', fontSize: '0.85rem', marginBottom: '0' }}>
  Description text
</p>
```

**✅ After:**
```tsx
<H3>Section Title</H3>
<Paragraph size="sm" color="textMuted" style={{ marginBottom: '0' }}>
  Description text
</Paragraph>
```

### 3. Form Labels and Input Text

```tsx
// Form labels
<Label>Field Name</Label>

// Validation messages
<Small color="warning">Please enter a valid email</Small>
<Small color="success">Looks good!</Small>

// Help text
<Caption>This field is optional</Caption>
```

### 4. Card and Component Content

```tsx
<Card>
  <Card.Body>
    <H4>Card Title</H4>
    <Paragraph>Card content with proper typography.</Paragraph>
    <Small color="textMuted">Updated 2 hours ago</Small>
  </Card.Body>
</Card>
```

### 5. Table Headers and Content

The StyledTable component automatically applies typography scaling, but you can use components for custom content:

```tsx
<th>
  <Text weight="semibold" size="sm">Column Header</Text>
</th>
<td>
  <Text size="sm">Cell content</Text>
</td>
```

## Theme Integration

All typography components automatically:
- Use theme colors (`theme.text`, `theme.textMuted`, etc.)
- Adapt to light/dark mode changes
- Apply consistent spacing using `theme.spacing`
- Maintain accessibility standards

## Responsive Behavior

The typography system includes responsive adjustments in `StyledTable` and can be extended for other components:

```tsx
// Desktop: base size
<Text size="base">Responsive text</Text>

// For mobile-specific sizing, use CSS media queries in styled components
const ResponsiveText = styled(Text)`
  @media (max-width: 576px) {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;
```

## Migration Strategy

### Phase 1: Core Components ✅
- ✅ Typography system created
- ✅ Theme integration complete
- ✅ BuySellComponent updated
- ✅ HomePage updated

### Phase 2: Forms and Tables
- Update all form components to use `Label`, `Small`, `Caption`
- Update table headers and content
- Update modal and dialog text

### Phase 3: Navigation and Layout
- Update navigation text
- Update sidebar content
- Update footer and header text

### Phase 4: Specialized Components
- Update notification components
- Update error and success messages
- Update loading states and placeholders

## Best Practices

1. **Consistency**: Always use typography components instead of raw HTML elements
2. **Semantic HTML**: Use appropriate `as` prop for semantic markup
3. **Accessibility**: Typography components maintain proper contrast ratios and font sizes
4. **Responsive**: Consider mobile users with appropriate sizing
5. **Theme Colors**: Use theme color props instead of custom colors

## Examples in the Codebase

See the following files for implementation examples:
- `/src/components/buysell/BuySellComponent.tsx`
- `/src/pages/HomePage.tsx`
- `/src/components/styled/TypographyStyled.tsx` (component definitions)

## Performance

Typography components are optimized styled-components that:
- Compile to efficient CSS
- Support tree-shaking
- Have minimal runtime overhead
- Cache styles effectively
