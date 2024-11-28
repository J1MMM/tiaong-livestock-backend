const resetPassEmail = (verificationCode) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

      <style>
          *{
              font-family: 'Poppins', sans-serif;
          }
          p{
              font-size: large
          }
      </style>
  </head>

  <body>
     <div style="width: 100%; background-color: #F5F5F3; padding: 80px 10px; box-sizing: border-box">
          <div style="width: 100%; background-color: #FFF; padding: 30px; max-width: 550px; margin: auto; box-sizing: border-box">
              <h1 style="margin: 0; text-align: start;  font-size: x-large">Tiaong Livestock Management System</h1>
              <br />
              <h1 style="margin: 0; text-align: start; font-weight: bold; font-size: x-large">Hello,</h1>
              <p style="text-align: start;">You have requested to reset the password of your account.</p>
              <p style="text-align: start;">Please find the security code to change your password:</p>
              <h1 style="margin: 0; text-align: start;  font-size: xx-large; color: #007bff">${verificationCode}</h1>
              <br />
              <h1 style="margin: 0; text-align: start; font-size: x-large">Thanks,</h1>
              <h1 style="margin: 0; text-align: start; font-size: x-large">Admin</h1>
              <br />
              <hr />
              <p style="text-align: start;">© 2024 Livestock Management System. All Rights Reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;
};

module.exports = resetPassEmail;
