import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { useEffect, useState } from 'react';
import { API_URL } from '../../App';
import { useAuth } from '../../contexts/Auth';

function Login({ isOpen, toggle }) {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loginValid, setLoginValid] = useState(true);

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
        }
    }, [isOpen]);

    const handleLogin = async(e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/user/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('login success!: ', data);
                login({ email, data });
                toggle();
            } else {
                console.error('login error: ', data.message);
                setLoginValid(!loginValid);
            }

        } catch (err) {
            console.error('login error: ', err);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader>login</ModalHeader>
        <ModalBody>
            <Form>
                <FormGroup>
                    <Label for="email">
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="Email"
                        type="email"
                        value={email}
                        invalid={!loginValid}
                        onChange={(e) => {setEmail(e.target.value); 
                                            setLoginValid(true)}}/>
                </FormGroup>
                <FormGroup>
                    <Label for="password">
                        Password
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        placeholder="Password"
                        type="password" 
                        value={password}
                        invalid={!loginValid}
                        onChange={(e) => {setPassword(e.target.value); 
                                            setLoginValid(true)}}/>
                    <FormFeedback>
                        Invalid email or password!
                    </FormFeedback>
                </FormGroup>
            </Form>
        </ModalBody>
        <ModalFooter>
            <Button style={{ backgroundColor: '#d1772e'}}
                    onClick={handleLogin}>login</Button>
            <Button onClick={toggle}>cancel</Button>
        </ModalFooter>
    </Modal>
    );
}

export default Login;
