
import { Post } from '@/lib/data';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewPostEmailProps {
  post: Omit<Post, 'id' | 'comments'>;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:9003';

export default function NewPostEmail({ post }: NewPostEmailProps) {
  const postUrl = `https://theglare.netlify.app/posts/${post.slug}`;
  const previewText = `New on Glare: ${post.title}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Glare.</Text>
          </Section>
          <Section style={mainImageContainer}>
            <Img
              src={post.coverImage}
              width="100%"
              height="auto"
              alt={post.title}
              style={mainImage}
            />
          </Section>
          <Section style={content}>
            <Text style={heading}>{post.title}</Text>
            <Text style={paragraph}>{post.description}</Text>
            <Button style={button} href={postUrl}>
              Read Full Article
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              You're receiving this email because you subscribed to the Glare newsletter. You can unsubscribe at any time.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const header = {
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#7c3aed',
  fontFamily: 'var(--font-space-grotesk), sans-serif',
};

const mainImageContainer = {
  padding: '0 20px',
};

const mainImage = {
  borderRadius: '8px',
};

const content = {
  padding: '20px 40px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginTop: '24px',
  color: '#1a1a1a',
  lineHeight: '1.3',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#555555',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '14px 20px',
  margin: '32px auto',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#888888',
  fontSize: '12px',
  textAlign: 'center' as const,
};
