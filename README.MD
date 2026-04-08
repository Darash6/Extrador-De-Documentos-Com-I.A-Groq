# Desafio técnico

## Desafio 1: Extrator de documentos

Contexto do Negócio
Muitas empresas perdem horas migrando dados de documentos físicos (fotos, notas, relatórios escaneados) para seus sistemas internos ou formulários oficiais. O objetivo deste desafio é criar uma ferramenta que atue como uma "ponte inteligente": ela lê um documento não estruturado e preenche automaticamente um modelo oficial da empresa.

Back-end (FastAPI)
API de Upload: Criar um endpoint com uma api Flask - FastAPI,que receba arquivos nos formatos PDF ou Imagem (JPG/PNG).
Processamento com IA: O sistema deve utilizar uma LLM (qualquer uma- via chave de api) para analisar o documento e extrair campos de identificação. Neste momento a qualidade da extração não é o mais importante, e sim saber usar de uma IA para fazer isso.

Campos Alvo:

Identificação: Nome Completo e CPF/CNPJ;

Cronologia: Data de emissão ou ocorrência;

Referência: Um período de tempo (Ex: Início e Fim de uma atividade ou serviço);

Ou qualquer campo de preenchimento que tenha no documento, como uma nota fiscal por exemplo, haverá vários campos a ser extraído.
Persistência: Salvar esses dados estruturados em um banco de dados NoSQL (como MongoDB ou Firebase).

Front-end (React ou HTML/JS)

Interface de Input: Um campo de "drag and drop" para o arquivo.
Dashboard de Conferência: Uma área onde o usuário visualize o que a IA extraiu.

Deve permitir que o usuário edite os campos caso a IA tenha cometido algum erro de leitura.
Exibir o JSON bruto para fins de depuração técnica.
