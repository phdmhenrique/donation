/* eslint-disable react/prop-types */
import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, completeRegistration } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const navigate = useNavigate();

  // Função para registrar um novo usuário
  const signup = async (userData) => {
    try {
      // Cadastro do usuário sem gerar o token
      const data = await registerUser(userData);
      setUser(data.user); // Armazenar os dados do usuário
    } catch (error) {
      console.error("Erro ao cadastrar:", error.response ? error.response.data : error.message);
      throw new Error("Erro ao registrar.");
    }
  };

  // Função para completar o registro com dados adicionais
  const completeRegistrationProcess = async (registrationData) => {
    try {
      const data = await completeRegistration(registrationData, token);
      setUser(data.user); // Atualiza os dados do usuário após o registro completo
    } catch (error) {
      console.error("Erro ao completar o registro:", error);
      throw new Error("Erro ao completar o registro.");
    }
  };

  // Função de login separada, que vai gerar o token
  const login = async (loginData) => {
    try {
      // Login do usuário para gerar o token
      const loginResponse = await loginUser(loginData);
      
      console.log("Dados do login:", loginResponse); // Verifique os dados do login

      setToken(loginResponse.accessToken); // Armazenar o token
      setUser(loginResponse.user); // Armazenar os dados do usuário
      localStorage.setItem("accessToken", loginResponse.accessToken); // Salvar token no localStorage
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw new Error("Erro ao fazer login.");
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    navigate("/")
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signup,
        login,
        logout,
        completeRegistrationProcess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
