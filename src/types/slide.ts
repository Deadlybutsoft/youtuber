export type SlideStyle =
  | 'hero'            // Big title + background image (cinematic opener)
  | 'split'           // Text left + image right
  | 'icon-grid'       // 2-4 cards with icons
  | 'stats'           // Big numbers
  | 'quote'           // Pull quote with attribution
  | 'chart-bar'       // Bar chart
  | 'chart-line'      // Line chart
  | 'chart-pie'       // Pie chart
  | 'diagram'         // SVG diagram/flowchart
  | 'gallery'         // 2-4 image grid
  | 'long-text'       // Paragraph text (for detailed explanations)
  | 'comparison'      // Side-by-side A vs B
  | 'timeline'        // Step-by-step timeline
  | 'code'            // Code snippet
  | 'big-statement';  // One bold sentence, no extras

export interface Slide {
  style: SlideStyle;
  title: string;
  subtitle?: string;
  content?: string[];
  icons?: string[];
  imageKeyword?: string;
  imageKeywords?: string[];
  script?: string;
  stats?: { value: string; label: string }[];
  chartData?: { name: string; value: number }[];
  svgCode?: string;
  code?: string;
  codeLanguage?: string;
  leftColumn?: { title: string; items: string[] };
  rightColumn?: { title: string; items: string[] };
  timelineSteps?: { label: string; text: string }[];
  longText?: string;
}
