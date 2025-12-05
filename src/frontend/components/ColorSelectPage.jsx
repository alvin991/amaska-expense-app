import { Container, Button } from 'react-bootstrap';
import ColorSelect from './ColorSelect';

const ColorSelectPage = ({
  navigation,
  value,
  onColorChosen,
  colors,
}) => {
  const handleChange = (newColor) => {
    onColorChosen?.(newColor);
    navigation.back(); // go back to previous page in stack
  };

  return (
    <Container className="mt-3">
      {/* {navigation.canGoBack && (
        <Button
          variant="secondary"
          className="mb-3"
          onClick={navigation.back}
        >
          Back
        </Button>
      )} */}

      <h2>Select Color</h2>

      <ColorSelect
        label={null}
        value={value}
        onChange={handleChange}
        colors={colors}
      />
    </Container>
  );
};

export default ColorSelectPage;