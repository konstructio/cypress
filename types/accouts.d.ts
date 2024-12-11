export type Account = {
  id: string;
  name: string;
  creation_timestamp: string;
  is_enabled: boolean;
  type: string;
  is_default: boolean;
  auth: Auth;
};

export type Auth = {
  akamai_auth: AkamaiAuthClass;
  aws_auth: AwsAuth;
  civo_auth: AkamaiAuthClass;
  do_auth: DoAuth;
  vultr_auth: AkamaiAuthClass;
  google_auth: GoogleAuth;
};

export type AkamaiAuthClass = {
  token: string;
};

export type AwsAuth = {
  role_arn: string;
};

export type DoAuth = {
  token: string;
  spaces_key: string;
  spaces_secret: string;
};

export type GoogleAuth = {};
