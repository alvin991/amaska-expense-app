import { Container, Button } from 'react-bootstrap';
import IconSelect from './IconSelect';

const IconSelectPage = ({
  navigation,
  selectedIconKey,
  onIconChosen,
  icons, // optional override
}) => {
  const handleIconSelect = (iconId) => {
    onIconChosen?.(iconId);
    navigation.back(); // go back to previous page in the stack
  };

  return (
    <Container className="mt-3">
      {navigation.canGoBack && (
        <Button
          variant="secondary"
          className="mb-3"
          onClick={navigation.back}
        >
          Back
        </Button>
      )}

      <h2>Select Icon</h2>

      <IconSelect
        icons={icons}
        selectedIconKey={selectedIconKey}
        onIconSelect={handleIconSelect}
      />
    </Container>
  );
};

export default IconSelectPage;