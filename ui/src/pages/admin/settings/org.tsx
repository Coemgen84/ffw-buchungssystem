import React from "react";
import { Form, Col, Row, Button, Alert } from "react-bootstrap";
import {
  ChevronLeft as IconBack,
  Save as IconSave,
  Loader as IconLoad,
} from "react-feather";
import { NextRouter } from "next/router";
import FullLayout from "@/components/FullLayout";
import Loading from "@/components/Loading";
import Link from "next/link";
import withReadyRouter from "@/components/withReadyRouter";
import { TranslationFunc, withTranslation } from "@/components/withTranslation";
import RuntimeConfig from "@/components/RuntimeConfig";
import AppLogo from "@/components/AppLogo";
import Organization from "@/types/Organization";
import Settings from "@/types/Settings";
import Ajax from "@/util/Ajax";
import RedirectUtil from "@/util/RedirectUtil";

interface State {
  loading: boolean;
  submitting: boolean;
  saved: boolean;
  error: boolean;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  language: string;
  customLogoUrl: string;
  customLogoTextLine1: string;
  customLogoTextLine2: string;
  verifyUuid: string;
  code: string;
}

interface Props {
  router: NextRouter;
  t: TranslationFunc;
}

class EditOrg extends React.Component<Props, State> {
  entity: Organization = new Organization();

  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
      submitting: false,
      saved: false,
      error: false,
      name: "",
      firstname: "",
      lastname: "",
      email: "",
      language: "de",
      customLogoUrl: "",
      customLogoTextLine1: "",
      customLogoTextLine2: "",
      verifyUuid: "",
      code: "",
    };
  }

  componentDidMount = () => {
    if (!Ajax.hasAccessToken() || !RuntimeConfig.INFOS.orgAdmin) {
      RedirectUtil.toLogin(this.props.router);
      return;
    }
    this.loadData();
  };

  loadData = () => {
    const id = RuntimeConfig.INFOS.organizationId;
    Promise.all([
      Organization.get(id),
      Settings.getOne("custom_logo_url").catch(() => ""),
      Settings.getOne("custom_logo_text_line1").catch(() => ""),
      Settings.getOne("custom_logo_text_line2").catch(() => ""),
    ]).then(
      ([org, customLogoUrl, customLogoTextLine1, customLogoTextLine2]) => {
        this.entity = org;
        this.setState({
          name: org.name,
          firstname: org.contactFirstname,
          lastname: org.contactLastname,
          email: org.contactEmail,
          language: org.language,
          customLogoUrl: customLogoUrl,
          customLogoTextLine1: customLogoTextLine1,
          customLogoTextLine2: customLogoTextLine2,
          loading: false,
        });
      },
    );
  };

  onSubmitVerify = (e: any) => {
    e.preventDefault();
    this.setState({
      error: false,
      saved: false,
    });
    let payload = {
      code: this.state.code,
    };
    Ajax.postData(
      this.entity.getBackendUrl() +
        this.entity.id +
        "/verifyemail/" +
        this.state.verifyUuid,
      payload,
    )
      .then(() => {
        this.setState({
          saved: true,
          verifyUuid: "",
          code: "",
        });
      })
      .catch(() => {
        this.setState({ error: true });
      });
  };

  onSubmit = (e: any) => {
    e.preventDefault();
    this.setState({
      error: false,
      saved: false,
      submitting: true,
    });
    this.entity.name = this.state.name;
    this.entity.language = this.state.language;
    this.entity.contactFirstname = this.state.firstname;
    this.entity.contactLastname = this.state.lastname;
    this.entity.contactEmail = this.state.email;
    Promise.all([
      Ajax.saveEntity(this.entity, this.entity.getBackendUrl()),
      Settings.setOne("custom_logo_url", this.state.customLogoUrl.trim()),
      Settings.setOne(
        "custom_logo_text_line1",
        this.state.customLogoTextLine1.trim(),
      ),
      Settings.setOne(
        "custom_logo_text_line2",
        this.state.customLogoTextLine2.trim(),
      ),
    ])
      .then(([res]) => {
        RuntimeConfig.INFOS.customLogoUrl = this.state.customLogoUrl.trim();
        RuntimeConfig.INFOS.customLogoTextLine1 =
          this.state.customLogoTextLine1.trim();
        RuntimeConfig.INFOS.customLogoTextLine2 =
          this.state.customLogoTextLine2.trim();
        this.setState({
          saved: res.json.verifyUuid ? false : true,
          verifyUuid: res.json.verifyUuid ? res.json.verifyUuid : "",
          submitting: false,
        });
      })
      .catch(() => {
        this.setState({ error: true, submitting: false });
      });
  };

  render() {
    let backButton = (
      <Link
        href="/admin/settings/"
        className="btn btn-sm btn-outline-secondary"
      >
        <IconBack className="feather" /> {this.props.t("back")}
      </Link>
    );
    let buttons = backButton;

    if (this.state.loading) {
      return (
        <FullLayout headline={this.props.t("editOrg")} buttons={buttons}>
          <Loading />
        </FullLayout>
      );
    }

    let hint = <></>;
    if (this.state.saved) {
      hint = <Alert variant="success">{this.props.t("entryUpdated")}</Alert>;
    } else if (this.state.error) {
      hint = <Alert variant="danger">{this.props.t("errorSave")}</Alert>;
    }

    const buttonSave = (
      <Button
        className="btn-sm"
        variant="outline-secondary"
        disabled={this.state.submitting}
        type="submit"
        form={this.state.verifyUuid ? "formVerify" : "form"}
      >
        {this.state.submitting && <IconLoad className="feather loader" />}
        {!this.state.submitting && <IconSave className="feather" />}{" "}
        {this.props.t("save")}
      </Button>
    );
    if (this.entity.id) {
      buttons = (
        <>
          {backButton} {buttonSave}
        </>
      );
    } else {
      buttons = (
        <>
          {backButton} {buttonSave}
        </>
      );
    }

    let languages = ["de", "en"];
    return (
      <FullLayout headline={this.props.t("editOrg")} buttons={buttons}>
        <Form
          onSubmit={this.onSubmit}
          id="form"
          hidden={this.state.verifyUuid ? true : false}
        >
          {hint}
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              {this.props.t("org")}
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="text"
                value={this.state.name}
                onChange={(e: any) => this.setState({ name: e.target.value })}
                required={true}
                autoFocus={true}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              {this.props.t("language")}
            </Form.Label>
            <Col sm="4">
              <Form.Select
                value={this.state.language}
                onChange={(e: any) =>
                  this.setState({ language: e.target.value })
                }
                required={true}
              >
                {languages.map((lc) => (
                  <option key={lc}>{lc}</option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2" htmlFor="input-customLogoUrl">
              {this.props.t("customLogoUrl")}
            </Form.Label>
            <Col sm="4">
              <Form.Control
                id="input-customLogoUrl"
                type="url"
                value={this.state.customLogoUrl}
                onChange={(e: any) =>
                  this.setState({ customLogoUrl: e.target.value })
                }
                placeholder="https://…"
              />
              <Form.Text className="text-muted">
                {this.props.t("customLogoUrlHint")}
              </Form.Text>
              <Form.Control
                id="input-customLogoTextLine1"
                className="mt-2"
                type="text"
                value={this.state.customLogoTextLine1}
                onChange={(e: any) =>
                  this.setState({ customLogoTextLine1: e.target.value })
                }
                placeholder={this.props.t("customLogoTextLine1")}
                maxLength={80}
              />
              <Form.Control
                id="input-customLogoTextLine2"
                className="mt-2"
                type="text"
                value={this.state.customLogoTextLine2}
                onChange={(e: any) =>
                  this.setState({ customLogoTextLine2: e.target.value })
                }
                placeholder={this.props.t("customLogoTextLine2")}
                maxLength={120}
              />
              <Form.Text className="text-muted">
                {this.props.t("customLogoTextHint")}
              </Form.Text>
              {this.state.customLogoUrl.trim() !== "" && (
                <div className="mt-2">
                  <AppLogo
                    src={this.state.customLogoUrl}
                    textLine1={this.state.customLogoTextLine1}
                    textLine2={this.state.customLogoTextLine2}
                    fallbackSrc="/ui/seatsurfing.svg"
                    style={{ maxWidth: "260px", maxHeight: "90px" }}
                  />
                </div>
              )}
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="6" className="lead text-uppercase">
              {this.props.t("primaryContact")}
            </Form.Label>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              {this.props.t("firstname")}
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="text"
                value={this.state.firstname}
                onChange={(e: any) =>
                  this.setState({ firstname: e.target.value })
                }
                required={true}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              {this.props.t("lastname")}
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="text"
                value={this.state.lastname}
                onChange={(e: any) =>
                  this.setState({ lastname: e.target.value })
                }
                required={true}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              {this.props.t("emailAddress")}
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="email"
                value={this.state.email}
                onChange={(e: any) => this.setState({ email: e.target.value })}
                required={true}
              />
            </Col>
          </Form.Group>
        </Form>
        <Form
          onSubmit={this.onSubmitVerify}
          id="formVerify"
          hidden={!this.state.verifyUuid}
        >
          {hint}
          <Form.Group as={Row}>
            <Form.Label column sm="6" className="lead text-uppercase">
              {this.props.t("verification")}
            </Form.Label>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="6">
              {this.props.t("verifyEmailHint")}
            </Form.Label>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              {this.props.t("code")}
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="text"
                minLength={6}
                maxLength={6}
                value={this.state.code}
                onChange={(e: any) => this.setState({ code: e.target.value })}
                required={this.state.verifyUuid ? true : false}
              />
            </Col>
          </Form.Group>
        </Form>
      </FullLayout>
    );
  }
}

export default withTranslation(withReadyRouter(EditOrg as any));
