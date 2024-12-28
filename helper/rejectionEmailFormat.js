const rejectionEmailFormat = (firstname, rejectionList) => {
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
          p,ul,li{
              font-size: large
          }

    
      </style>
  </head>

  <body>
     <div style="width: 100%; background-color: #F5F5F3; padding: 80px 10px; box-sizing: border-box">
          <div style="width: 100%; background-color: #FFF; padding: 30px; max-width: 550px; margin: auto; box-sizing: border-box">
              <h1 style="margin: 0; text-align: start; font-weight: bold; font-size: x-large">Dear ${firstname},</h1>
              <p style="text-align: start;">We regret to inform you that your application for Tiaong Livestock Management System has been rejected due to one or more of the following reasons:</p>
              <ul>
              ${rejectionList.join("\n  ")}
              </ul>
              
              <p style="text-align: start;">To resolve this, we kindly request you to review and correct your application form. Please log in to your account using your email and password through the mobile login platform to access and update your form.</p>
              <p style="text-align: start;">We encourage you to submit a complete application with all required documents to ensure that your request is processed efficiently.</p>
              <p style="text-align: start;">Thank you for your understanding.</p>

              <p style="text-align: start;">Sincerely,</p>
              <p style="text-align: start;">Livestock Management Admin</p>


              <hr />
              <p style="text-align: start;">© 2024 Livestock Management System. All Rights Reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;
};

module.exports = rejectionEmailFormat;
