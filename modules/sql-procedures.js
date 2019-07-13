import sequelize from './sequelize';

const createSQLProcedures = sequelize.query(`
    CREATE OR ALTER PROC CheckIfEmailExists @Email VARCHAR(150)
    AS
    BEGIN
    select 1 as response from Users where email = @Email
    END;
    
    GO
    
    CREATE OR ALTER PROC CheckIfLoginExists @Login VARCHAR(100)
    AS
    BEGIN
    select 1 as response from Users where login = @Login
    END;
    
    GO
    
    CREATE OR ALTER PROC CheckIfLoginOrEmailExists @Data VARCHAR(100)
    AS
    BEGIN
    select 1 as response from Users where login = @Data OR email = @Data
    END;
    
    GO
    
    CREATE OR ALTER PROC CheckIfTokenForResettingPasswordExists @Data VARCHAR(100)
    AS
    BEGIN
    select 1 as response from PasswordResetterTemps where token = @Data
    END;
    
    GO
    
    CREATE OR ALTER PROC CheckIfTokenForEmailConfirmationExists @Data VARCHAR(100)
    AS
    BEGIN
    select 1 as response from EmailConfirmationTemps where token = @Data
    END;
    
    GO
    
    CREATE OR ALTER PROC CheckIfEmailIsConfirmed @Data VARCHAR(100)
    AS
    BEGIN
    select 1 as response from EmailConfirmationTemps where userId = @Data
    END;
    
    GO
    
    CREATE OR ALTER PROC CheckIfTokenForEmailAlteringConfirmationExists @Data VARCHAR(100)
    AS
    BEGIN
    select 1 as response from EmailAlteringConfirmationTemp where token = @Data
    END;
`);

export default createSQLProcedures;
