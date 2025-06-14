import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Form, FormGroup, Label, Input, FormFeedback } from 'reactstrap';
import { API_URL } from '../../App';

function Register({ isOpen, toggle }) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [code, setCode] = useState(0);
    const [passwordsMatching, setPasswordsMatching] = useState(true);

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setPasswordConfirm('');
            setCode(0);
        }
    }, [isOpen]);

    const handleRegister = async(e) => {
        e.preventDefault();

        if (password != passwordConfirm) {
            setPasswordsMatching(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if(response.ok) {
                console.log('registration success!: ', data);
                toggle();
            } else {
                console.error('registration failed: ', data.message);
                setCode(response.status);
            }

        } catch (err) {
            console.error('registration error: ', err);
        }

    }

    return (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader>register</ModalHeader>
        <ModalBody>
            <Form>
                <FormGroup>
                    <Label for="email">
                        Email:
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        invalid={code == 409}
                        onChange={(e) => {setEmail(e.target.value);
                                            setCode(0);
                        }}/>
                    <FormFeedback>
                        User already exists!
                    </FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label for="password">
                        Password:
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        invalid={!passwordsMatching}
                        onChange={(e) => {setPassword(e.target.value);
                                            setPasswordsMatching(true);
                        }}/>
                </FormGroup>
                <FormGroup>
                    <Label for="passwordConfirm">
                        Please re-enter password:
                    </Label>
                    <Input
                        id="passwordConfirm"
                        name="passwordConfirm"
                        type="password"
                        value={passwordConfirm}
                        invalid={!passwordsMatching}
                        onChange={(e) => {setPasswordConfirm(e.target.value);
                                            setPasswordsMatching(true);
                        }}/>
                    <FormFeedback>
                        Passwords don't match!
                    </FormFeedback>
                </FormGroup>
            </Form>
        </ModalBody>
        <ModalFooter>
            <Button style={{ backgroundColor: '#d1772e'}} 
                    onClick={handleRegister}>register</Button>
            <Button onClick={toggle}>cancel</Button>
        </ModalFooter>
    </Modal>
    );
}

export default Register;